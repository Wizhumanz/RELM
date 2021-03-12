
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Navbar.svelte generated by Svelte v3.32.3 */

    const file = "src/Navbar.svelte";

    // (35:16) {:else}
    function create_else_block(ctx) {
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;

    	const block = {
    		c: function create() {
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "All Listings";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Pending Listings";
    			attr_dev(a0, "class", "nav-link active svelte-d1tth2");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 36, 24, 1305);
    			attr_dev(li0, "class", "nav-item svelte-d1tth2");
    			add_location(li0, file, 35, 20, 1259);
    			attr_dev(a1, "class", "nav-link active svelte-d1tth2");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file, 39, 24, 1450);
    			attr_dev(li1, "class", "nav-item svelte-d1tth2");
    			add_location(li1, file, 38, 20, 1404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li0, anchor);
    			append_dev(li0, a0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, li1, anchor);
    			append_dev(li1, a1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(li1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(35:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:16) {#if !id}
    function create_if_block(ctx) {
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;

    	const block = {
    		c: function create() {
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "About";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Pricing";
    			attr_dev(a0, "class", "nav-link active svelte-d1tth2");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 29, 24, 1003);
    			attr_dev(li0, "class", "nav-item svelte-d1tth2");
    			add_location(li0, file, 28, 20, 957);
    			attr_dev(a1, "class", "nav-link active svelte-d1tth2");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file, 32, 24, 1141);
    			attr_dev(li1, "class", "nav-item svelte-d1tth2");
    			add_location(li1, file, 31, 20, 1095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li0, anchor);
    			append_dev(li0, a0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, li1, anchor);
    			append_dev(li1, a1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(li1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:16) {#if !id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let div1;
    	let a;
    	let t1;
    	let button;
    	let i;
    	let t2;
    	let div0;
    	let ul;
    	let t3;
    	let li;
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (!/*id*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "RELM";
    			t1 = space();
    			button = element("button");
    			i = element("i");
    			t2 = space();
    			div0 = element("div");
    			ul = element("ul");
    			if_block.c();
    			t3 = space();
    			li = element("li");
    			span = element("span");
    			span.textContent = "***";
    			attr_dev(a, "class", "navbar-brand svelte-d1tth2");
    			attr_dev(a, "href", "/");
    			add_location(a, file, 13, 8, 366);
    			attr_dev(i, "class", "bi bi-arrow-down-left-square-fill svelte-d1tth2");
    			add_location(i, file, 23, 12, 726);
    			attr_dev(button, "class", "navbar-toggler svelte-d1tth2");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarSupportedContent");
    			attr_dev(button, "aria-controls", "navbarSupportedContent");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 14, 8, 416);
    			add_location(span, file, 43, 20, 1623);
    			attr_dev(li, "class", "nav-item d-sm-none svelte-d1tth2");
    			add_location(li, file, 42, 16, 1571);
    			attr_dev(ul, "class", "navbar-nav ms-auto svelte-d1tth2");
    			add_location(ul, file, 26, 12, 879);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarSupportedContent");
    			add_location(div0, file, 25, 8, 800);
    			attr_dev(div1, "class", "container-fluid");
    			add_location(div1, file, 12, 4, 328);
    			attr_dev(nav, "class", "navbar navbar-expand-sm sticky-top navbar-light svelte-d1tth2");
    			attr_dev(nav, "id", "the-nav");
    			add_location(nav, file, 11, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, i);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			if_block.m(ul, null);
    			append_dev(ul, t3);
    			append_dev(ul, li);
    			append_dev(li, span);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(ul, t3);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	let { id } = $$props;
    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ id });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Navbar> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ListingLI.svelte generated by Svelte v3.32.3 */
    const file$1 = "src/ListingLI.svelte";

    // (52:12) {:else}
    function create_else_block$1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Learn More";
    			attr_dev(button, "class", "svelte-o7yqnj");
    			add_location(button, file$1, 52, 16, 1778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(52:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:12) {#if id && id !== ""}
    function create_if_block$1(ctx) {
    	let div0;
    	let input0;
    	let t0;
    	let div1;
    	let input1;
    	let t1;
    	let div2;
    	let input2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			input0 = element("input");
    			t0 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t1 = space();
    			div2 = element("div");
    			input2 = element("input");
    			attr_dev(input0, "class", "form-check-input svelte-o7yqnj");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "id", "inlineCheckbox1");
    			input0.__value = "option1";
    			input0.value = input0.__value;
    			add_location(input0, file$1, 26, 20, 788);
    			attr_dev(div0, "class", "form-check form-check-inline");
    			add_location(div0, file$1, 25, 16, 725);
    			attr_dev(input1, "class", "form-check-input svelte-o7yqnj");
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "id", "inlineCheckbox2");
    			input1.__value = "option2";
    			input1.value = input1.__value;
    			add_location(input1, file$1, 35, 20, 1150);
    			attr_dev(div1, "class", "form-check form-check-inline");
    			add_location(div1, file$1, 34, 16, 1087);
    			attr_dev(input2, "class", "form-check-input svelte-o7yqnj");
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "id", "inlineCheckbox3");
    			input2.value = "option3";
    			add_location(input2, file$1, 44, 20, 1515);
    			attr_dev(div2, "class", "form-check form-check-inline");
    			add_location(div2, file$1, 43, 16, 1452);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input0);
    			input0.checked = /*listing*/ ctx[0].isPublic;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input1);
    			input1.checked = /*listing*/ ctx[0].isCompleted;
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[2]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*listing*/ 1) {
    				input0.checked = /*listing*/ ctx[0].isPublic;
    			}

    			if (dirty & /*listing*/ 1) {
    				input1.checked = /*listing*/ ctx[0].isCompleted;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(25:12) {#if id && id !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let h1;
    	let i;
    	let t0;
    	let div1;
    	let h4;
    	let t1_value = /*listing*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let p0;
    	let t3_value = /*listing*/ ctx[0].address + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6_value = /*listing*/ ctx[0].listingType + "";
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9_value = /*listing*/ ctx[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "";
    	let t9;
    	let t10;
    	let div2;
    	let t11;
    	let hr;

    	function select_block_type(ctx, dirty) {
    		if (/*id*/ ctx[1] && /*id*/ ctx[1] !== "") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			i = element("i");
    			t0 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p0 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Type: ");
    			t6 = text(t6_value);
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Price: RM ");
    			t9 = text(t9_value);
    			t10 = space();
    			div2 = element("div");
    			if_block.c();
    			t11 = space();
    			hr = element("hr");
    			attr_dev(i, "class", "bi bi-house-door");
    			add_location(i, file$1, 11, 16, 267);
    			attr_dev(h1, "class", "svelte-o7yqnj");
    			add_location(h1, file$1, 11, 12, 263);
    			attr_dev(div0, "class", "col-2 d-flex justify-content-center");
    			add_location(div0, file$1, 10, 8, 201);
    			attr_dev(h4, "class", "svelte-o7yqnj");
    			add_location(h4, file$1, 14, 12, 358);
    			attr_dev(p0, "class", "svelte-o7yqnj");
    			add_location(p0, file$1, 15, 12, 394);
    			attr_dev(p1, "class", "svelte-o7yqnj");
    			add_location(p1, file$1, 16, 12, 431);
    			attr_dev(p2, "class", "svelte-o7yqnj");
    			add_location(p2, file$1, 17, 12, 478);
    			attr_dev(div1, "class", "col-7");
    			add_location(div1, file$1, 13, 8, 326);
    			attr_dev(div2, "class", "col-3");
    			add_location(div2, file$1, 23, 8, 655);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$1, 9, 4, 175);
    			attr_dev(hr, "class", "svelte-o7yqnj");
    			add_location(hr, file$1, 56, 4, 1854);
    			attr_dev(div4, "class", "container svelte-o7yqnj");
    			add_location(div4, file$1, 8, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(h1, i);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, h4);
    			append_dev(h4, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			if_block.m(div2, null);
    			append_dev(div4, t11);
    			append_dev(div4, hr);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*listing*/ 1 && t1_value !== (t1_value = /*listing*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*listing*/ 1 && t3_value !== (t3_value = /*listing*/ ctx[0].address + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*listing*/ 1 && t6_value !== (t6_value = /*listing*/ ctx[0].listingType + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*listing*/ 1 && t9_value !== (t9_value = /*listing*/ ctx[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "")) set_data_dev(t9, t9_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListingLI", slots, []);
    	let { id } = $$props;
    	let { listing = {} } = $$props;
    	const writable_props = ["id", "listing"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListingLI> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		listing.isPublic = this.checked;
    		$$invalidate(0, listing);
    	}

    	function input1_change_handler() {
    		listing.isCompleted = this.checked;
    		$$invalidate(0, listing);
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("listing" in $$props) $$invalidate(0, listing = $$props.listing);
    	};

    	$$self.$capture_state = () => ({ ListingLI: ListingLI_1, id, listing });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("listing" in $$props) $$invalidate(0, listing = $$props.listing);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [listing, id, input0_change_handler, input1_change_handler];
    }

    class ListingLI_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 1, listing: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListingLI_1",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<ListingLI> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<ListingLI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ListingLI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listing() {
    		throw new Error("<ListingLI>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listing(value) {
    		throw new Error("<ListingLI>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/AddListing.svelte generated by Svelte v3.32.3 */

    const file$2 = "src/AddListing.svelte";

    function create_fragment$2(ctx) {
    	let div8;
    	let h1;
    	let t1;
    	let div7;
    	let div0;
    	let button0;
    	let t3;
    	let div6;
    	let div5;
    	let h4;
    	let t5;
    	let form;
    	let div1;
    	let label0;
    	let t7;
    	let input0;
    	let t8;
    	let div2;
    	let label1;
    	let t10;
    	let input1;
    	let t11;
    	let div3;
    	let label2;
    	let t13;
    	let select;
    	let option0;
    	let option1;
    	let t16;
    	let div4;
    	let label3;
    	let t18;
    	let input2;
    	let t19;
    	let button1;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Add Listing";
    			t1 = space();
    			div7 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Upload Excel";
    			t3 = space();
    			div6 = element("div");
    			div5 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Manual Add";
    			t5 = space();
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Address";
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Address";
    			t13 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Rent";
    			option1 = element("option");
    			option1.textContent = "Buy";
    			t16 = space();
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Price";
    			t18 = space();
    			input2 = element("input");
    			t19 = space();
    			button1 = element("button");
    			button1.textContent = "Add";
    			attr_dev(h1, "class", "svelte-17tibwm");
    			add_location(h1, file$2, 4, 4, 48);
    			attr_dev(button0, "id", "excel-upload");
    			attr_dev(button0, "class", "svelte-17tibwm");
    			add_location(button0, file$2, 8, 12, 142);
    			attr_dev(div0, "class", "col-sm col-md-3");
    			add_location(div0, file$2, 7, 8, 100);
    			attr_dev(h4, "class", "section-head svelte-17tibwm");
    			add_location(h4, file$2, 12, 16, 297);
    			attr_dev(label0, "for", "name");
    			attr_dev(label0, "class", "form-label svelte-17tibwm");
    			add_location(label0, file$2, 15, 24, 437);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control svelte-17tibwm");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "Premium Condo");
    			add_location(input0, file$2, 16, 24, 511);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$2, 14, 20, 394);
    			attr_dev(label1, "for", "address");
    			attr_dev(label1, "class", "form-label svelte-17tibwm");
    			add_location(label1, file$2, 24, 24, 818);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control svelte-17tibwm");
    			attr_dev(input1, "id", "address");
    			attr_dev(input1, "placeholder", "38-A Skyhome, Jalan Tanjung Tokong");
    			add_location(input1, file$2, 25, 24, 898);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$2, 23, 20, 775);
    			attr_dev(label2, "for", "listingType");
    			attr_dev(label2, "class", "form-label svelte-17tibwm");
    			add_location(label2, file$2, 33, 24, 1229);
    			option0.__value = "Rent";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 35, 28, 1387);
    			option1.__value = "Buy";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 36, 28, 1450);
    			attr_dev(select, "id", "listingType");
    			attr_dev(select, "class", "form-select svelte-17tibwm");
    			add_location(select, file$2, 34, 24, 1313);
    			attr_dev(div3, "class", "mb-3");
    			add_location(div3, file$2, 32, 20, 1186);
    			attr_dev(label3, "for", "price");
    			attr_dev(label3, "class", "form-label svelte-17tibwm");
    			add_location(label3, file$2, 40, 24, 1607);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "class", "form-control svelte-17tibwm");
    			attr_dev(input2, "id", "price");
    			attr_dev(input2, "placeholder", "RM 1,000");
    			add_location(input2, file$2, 41, 24, 1683);
    			attr_dev(div4, "class", "mb-3");
    			add_location(div4, file$2, 39, 20, 1564);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "svelte-17tibwm");
    			add_location(button1, file$2, 48, 20, 1945);
    			attr_dev(form, "class", "form svelte-17tibwm");
    			add_location(form, file$2, 13, 16, 354);
    			attr_dev(div5, "id", "manual-add-box");
    			attr_dev(div5, "class", "svelte-17tibwm");
    			add_location(div5, file$2, 11, 12, 255);
    			attr_dev(div6, "class", "col-sm col-md-9");
    			add_location(div6, file$2, 10, 8, 213);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$2, 6, 4, 74);
    			attr_dev(div8, "class", "container svelte-17tibwm");
    			add_location(div8, file$2, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, h1);
    			append_dev(div8, t1);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, button0);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h4);
    			append_dev(div5, t5);
    			append_dev(div5, form);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t7);
    			append_dev(div1, input0);
    			append_dev(form, t8);
    			append_dev(form, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t10);
    			append_dev(div2, input1);
    			append_dev(form, t11);
    			append_dev(form, div3);
    			append_dev(div3, label2);
    			append_dev(div3, t13);
    			append_dev(div3, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(form, t16);
    			append_dev(form, div4);
    			append_dev(div4, label3);
    			append_dev(div4, t18);
    			append_dev(div4, input2);
    			append_dev(form, t19);
    			append_dev(form, button1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddListing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddListing> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class AddListing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddListing",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Listings.svelte generated by Svelte v3.32.3 */
    const file$3 = "src/Listings.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (15:4) {#if id && id !== ""}
    function create_if_block_3(ctx) {
    	let addlisting;
    	let current;
    	addlisting = new AddListing({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addlisting.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addlisting, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addlisting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addlisting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addlisting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(15:4) {#if id && id !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {:else}
    function create_else_block$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Public Listings";
    			attr_dev(h1, "class", "svelte-ruydh9");
    			add_location(h1, file$3, 21, 8, 462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(21:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#if id && id !== ""}
    function create_if_block_2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "All Listings";
    			attr_dev(h1, "class", "svelte-ruydh9");
    			add_location(h1, file$3, 19, 8, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(19:4) {#if id && id !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (91:4) {#if id && id !== ""}
    function create_if_block_1(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let ul;
    	let li0;
    	let t3;
    	let li1;
    	let t5;
    	let li2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Public";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "Complete";
    			t5 = space();
    			li2 = element("li");
    			li2.textContent = "Check";
    			attr_dev(div0, "class", "col-2");
    			add_location(div0, file$3, 92, 12, 2745);
    			attr_dev(div1, "class", "col-7");
    			add_location(div1, file$3, 93, 12, 2779);
    			attr_dev(li0, "class", "svelte-ruydh9");
    			add_location(li0, file$3, 96, 20, 2896);
    			attr_dev(li1, "class", "svelte-ruydh9");
    			add_location(li1, file$3, 97, 20, 2932);
    			attr_dev(li2, "class", "svelte-ruydh9");
    			add_location(li2, file$3, 98, 20, 2970);
    			attr_dev(ul, "id", "checkbox-headers");
    			attr_dev(ul, "class", "svelte-ruydh9");
    			add_location(ul, file$3, 95, 16, 2849);
    			attr_dev(div2, "class", "col-3");
    			add_location(div2, file$3, 94, 12, 2813);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$3, 91, 8, 2715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(91:4) {#if id && id !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (105:4) {#each listings as l}
    function create_each_block(ctx) {
    	let listingli;
    	let current;

    	listingli = new ListingLI_1({
    			props: {
    				id: /*id*/ ctx[0],
    				listing: /*l*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listingli.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listingli, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listingli_changes = {};
    			if (dirty & /*id*/ 1) listingli_changes.id = /*id*/ ctx[0];
    			if (dirty & /*listings*/ 2) listingli_changes.listing = /*l*/ ctx[10];
    			listingli.$set(listingli_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listingli.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listingli.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listingli, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(105:4) {#each listings as l}",
    		ctx
    	});

    	return block;
    }

    // (109:4) {#if id && id !== ""}
    function create_if_block$2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Update Listings";
    			attr_dev(button, "class", "svelte-ruydh9");
    			add_location(button, file$3, 109, 8, 3164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(109:4) {#if id && id !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div6;
    	let t0;
    	let t1;
    	let div5;
    	let a;
    	let t2;
    	let i;
    	let t3;
    	let div4;
    	let h40;
    	let t5;
    	let div0;
    	let input0;
    	let t6;
    	let label0;
    	let t8;
    	let div1;
    	let input1;
    	let t9;
    	let label1;
    	let t11;
    	let h41;
    	let t13;
    	let div2;
    	let input2;
    	let t14;
    	let label2;
    	let t16;
    	let div3;
    	let input3;
    	let t17;
    	let label3;
    	let t19;
    	let hr;
    	let t20;
    	let t21;
    	let t22;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*id*/ ctx[0] && /*id*/ ctx[0] !== "" && create_if_block_3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*id*/ ctx[0] && /*id*/ ctx[0] !== "") return create_if_block_2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*id*/ ctx[0] && /*id*/ ctx[0] !== "" && create_if_block_1(ctx);
    	let each_value = /*listings*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block3 = /*id*/ ctx[0] && /*id*/ ctx[0] !== "" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			div5 = element("div");
    			a = element("a");
    			t2 = text("Filter ");
    			i = element("i");
    			t3 = space();
    			div4 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Listing Types";
    			t5 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t6 = space();
    			label0 = element("label");
    			label0.textContent = "Public";
    			t8 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t9 = space();
    			label1 = element("label");
    			label1.textContent = "Completed";
    			t11 = space();
    			h41 = element("h4");
    			h41.textContent = "Property Types";
    			t13 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t14 = space();
    			label2 = element("label");
    			label2.textContent = "Apartments";
    			t16 = space();
    			div3 = element("div");
    			input3 = element("input");
    			t17 = space();
    			label3 = element("label");
    			label3.textContent = "Landed";
    			t19 = space();
    			hr = element("hr");
    			t20 = space();
    			if (if_block2) if_block2.c();
    			t21 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t22 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(i, "class", "bi bi-caret-down-fill");
    			add_location(i, file$3, 33, 19, 770);
    			attr_dev(a, "data-bs-toggle", "collapse");
    			attr_dev(a, "href", "#filter-options");
    			attr_dev(a, "role", "button");
    			attr_dev(a, "aria-expanded", "false");
    			attr_dev(a, "aria-controls", "filter-options");
    			attr_dev(a, "class", "expander svelte-ruydh9");
    			add_location(a, file$3, 25, 8, 533);
    			attr_dev(h40, "class", "svelte-ruydh9");
    			add_location(h40, file$3, 36, 12, 882);
    			attr_dev(input0, "class", "form-check-input svelte-ruydh9");
    			attr_dev(input0, "type", "checkbox");
    			input0.__value = "";
    			input0.value = input0.__value;
    			attr_dev(input0, "id", "flexCheckDefault");
    			add_location(input0, file$3, 38, 16, 958);
    			attr_dev(label0, "class", "form-check-label svelte-ruydh9");
    			attr_dev(label0, "for", "flexCheckDefault");
    			add_location(label0, file$3, 45, 16, 1198);
    			attr_dev(div0, "class", "form-check");
    			add_location(div0, file$3, 37, 12, 917);
    			attr_dev(input1, "class", "form-check-input svelte-ruydh9");
    			attr_dev(input1, "type", "checkbox");
    			input1.__value = "";
    			input1.value = input1.__value;
    			attr_dev(input1, "id", "flexCheckChecked");
    			add_location(input1, file$3, 50, 16, 1378);
    			attr_dev(label1, "class", "form-check-label svelte-ruydh9");
    			attr_dev(label1, "for", "flexCheckChecked");
    			add_location(label1, file$3, 57, 16, 1621);
    			attr_dev(div1, "class", "form-check");
    			add_location(div1, file$3, 49, 12, 1337);
    			attr_dev(h41, "class", "svelte-ruydh9");
    			add_location(h41, file$3, 61, 12, 1763);
    			attr_dev(input2, "class", "form-check-input svelte-ruydh9");
    			attr_dev(input2, "type", "checkbox");
    			input2.__value = "";
    			input2.value = input2.__value;
    			attr_dev(input2, "id", "flexCheckDefault");
    			add_location(input2, file$3, 63, 16, 1840);
    			attr_dev(label2, "class", "form-check-label svelte-ruydh9");
    			attr_dev(label2, "for", "flexCheckDefault");
    			add_location(label2, file$3, 70, 16, 2084);
    			attr_dev(div2, "class", "form-check");
    			add_location(div2, file$3, 62, 12, 1799);
    			attr_dev(input3, "class", "form-check-input svelte-ruydh9");
    			attr_dev(input3, "type", "checkbox");
    			input3.__value = "";
    			input3.value = input3.__value;
    			attr_dev(input3, "id", "flexCheckChecked");
    			add_location(input3, file$3, 75, 16, 2268);
    			attr_dev(label3, "class", "form-check-label svelte-ruydh9");
    			attr_dev(label3, "for", "flexCheckChecked");
    			add_location(label3, file$3, 82, 16, 2508);
    			attr_dev(div3, "class", "form-check");
    			add_location(div3, file$3, 74, 12, 2227);
    			attr_dev(hr, "class", "svelte-ruydh9");
    			add_location(hr, file$3, 86, 12, 2647);
    			attr_dev(div4, "id", "filter-options");
    			attr_dev(div4, "class", "collapse svelte-ruydh9");
    			add_location(div4, file$3, 35, 8, 827);
    			attr_dev(div5, "id", "filters-box");
    			attr_dev(div5, "class", "svelte-ruydh9");
    			add_location(div5, file$3, 24, 4, 502);
    			attr_dev(div6, "class", "container svelte-ruydh9");
    			add_location(div6, file$3, 12, 0, 284);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			if (if_block0) if_block0.m(div6, null);
    			append_dev(div6, t0);
    			if_block1.m(div6, null);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, a);
    			append_dev(a, t2);
    			append_dev(a, i);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, h40);
    			append_dev(div4, t5);
    			append_dev(div4, div0);
    			append_dev(div0, input0);
    			input0.checked = /*showPublic*/ ctx[2];
    			append_dev(div0, t6);
    			append_dev(div0, label0);
    			append_dev(div4, t8);
    			append_dev(div4, div1);
    			append_dev(div1, input1);
    			input1.checked = /*showCompleted*/ ctx[3];
    			append_dev(div1, t9);
    			append_dev(div1, label1);
    			append_dev(div4, t11);
    			append_dev(div4, h41);
    			append_dev(div4, t13);
    			append_dev(div4, div2);
    			append_dev(div2, input2);
    			input2.checked = /*showApartments*/ ctx[4];
    			append_dev(div2, t14);
    			append_dev(div2, label2);
    			append_dev(div4, t16);
    			append_dev(div4, div3);
    			append_dev(div3, input3);
    			input3.checked = /*showLanded*/ ctx[5];
    			append_dev(div3, t17);
    			append_dev(div3, label3);
    			append_dev(div4, t19);
    			append_dev(div4, hr);
    			append_dev(div6, t20);
    			if (if_block2) if_block2.m(div6, null);
    			append_dev(div6, t21);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			append_dev(div6, t22);
    			if (if_block3) if_block3.m(div6, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[6]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[7]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[8]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*id*/ ctx[0] && /*id*/ ctx[0] !== "") {
    				if (if_block0) {
    					if (dirty & /*id*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div6, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div6, t1);
    				}
    			}

    			if (dirty & /*showPublic*/ 4) {
    				input0.checked = /*showPublic*/ ctx[2];
    			}

    			if (dirty & /*showCompleted*/ 8) {
    				input1.checked = /*showCompleted*/ ctx[3];
    			}

    			if (dirty & /*showApartments*/ 16) {
    				input2.checked = /*showApartments*/ ctx[4];
    			}

    			if (dirty & /*showLanded*/ 32) {
    				input3.checked = /*showLanded*/ ctx[5];
    			}

    			if (/*id*/ ctx[0] && /*id*/ ctx[0] !== "") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(div6, t21);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*id, listings*/ 3) {
    				each_value = /*listings*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div6, t22);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*id*/ ctx[0] && /*id*/ ctx[0] !== "") {
    				if (if_block3) ; else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					if_block3.m(div6, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Listings", slots, []);
    	let { id } = $$props;
    	let { listings = [] } = $$props;
    	let showPublic = true;
    	let showCompleted = false;
    	let showApartments = true;
    	let showLanded = true;
    	const writable_props = ["id", "listings"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Listings> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		showPublic = this.checked;
    		$$invalidate(2, showPublic);
    	}

    	function input1_change_handler() {
    		showCompleted = this.checked;
    		$$invalidate(3, showCompleted);
    	}

    	function input2_change_handler() {
    		showApartments = this.checked;
    		$$invalidate(4, showApartments);
    	}

    	function input3_change_handler() {
    		showLanded = this.checked;
    		$$invalidate(5, showLanded);
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("listings" in $$props) $$invalidate(1, listings = $$props.listings);
    	};

    	$$self.$capture_state = () => ({
    		ListingLI: ListingLI_1,
    		AddListing,
    		id,
    		listings,
    		showPublic,
    		showCompleted,
    		showApartments,
    		showLanded
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("listings" in $$props) $$invalidate(1, listings = $$props.listings);
    		if ("showPublic" in $$props) $$invalidate(2, showPublic = $$props.showPublic);
    		if ("showCompleted" in $$props) $$invalidate(3, showCompleted = $$props.showCompleted);
    		if ("showApartments" in $$props) $$invalidate(4, showApartments = $$props.showApartments);
    		if ("showLanded" in $$props) $$invalidate(5, showLanded = $$props.showLanded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		id,
    		listings,
    		showPublic,
    		showCompleted,
    		showApartments,
    		showLanded,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler
    	];
    }

    class Listings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { id: 0, listings: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Listings",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Listings> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Listings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Listings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listings() {
    		throw new Error("<Listings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listings(value) {
    		throw new Error("<Listings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$4 = "src/App.svelte";

    // (78:1) {#if !isLoggedIn}
    function create_if_block$3(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let strong0;
    	let t3;
    	let strong1;
    	let t5;
    	let strong2;
    	let t7;
    	let strong3;
    	let t9;
    	let t10;
    	let p1;
    	let t11;
    	let a;
    	let t13;
    	let t14;
    	let div3;
    	let h4;
    	let t16;
    	let form;
    	let div1;
    	let label0;
    	let t18;
    	let input0;
    	let t19;
    	let div2;
    	let label1;
    	let t21;
    	let input1;
    	let t22;
    	let button;
    	let t24;
    	let hr;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "RELM";
    			t1 = space();
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "R";
    			t3 = text("eal ");
    			strong1 = element("strong");
    			strong1.textContent = "E";
    			t5 = text("state\n\t\t\t\t\t\t");
    			strong2 = element("strong");
    			strong2.textContent = "L";
    			t7 = text("isting ");
    			strong3 = element("strong");
    			strong3.textContent = "M";
    			t9 = text("anager.");
    			t10 = space();
    			p1 = element("p");
    			t11 = text("Designed by ");
    			a = element("a");
    			a.textContent = "Myika Technologies";
    			t13 = text(".");
    			t14 = space();
    			div3 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Sign In";
    			t16 = space();
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t18 = space();
    			input0 = element("input");
    			t19 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t21 = space();
    			input1 = element("input");
    			t22 = space();
    			button = element("button");
    			button.textContent = "Sign In";
    			t24 = space();
    			hr = element("hr");
    			attr_dev(h1, "class", "brand section-head svelte-1p7yyqp");
    			add_location(h1, file$4, 81, 5, 1716);
    			attr_dev(strong0, "class", "svelte-1p7yyqp");
    			add_location(strong0, file$4, 83, 6, 1772);
    			attr_dev(strong1, "class", "svelte-1p7yyqp");
    			add_location(strong1, file$4, 83, 28, 1794);
    			attr_dev(strong2, "class", "svelte-1p7yyqp");
    			add_location(strong2, file$4, 84, 6, 1824);
    			attr_dev(strong3, "class", "svelte-1p7yyqp");
    			add_location(strong3, file$4, 84, 31, 1849);
    			attr_dev(p0, "class", "svelte-1p7yyqp");
    			add_location(p0, file$4, 82, 5, 1762);
    			attr_dev(a, "href", "https://myika.co");
    			attr_dev(a, "class", "svelte-1p7yyqp");
    			add_location(a, file$4, 87, 18, 1912);
    			attr_dev(p1, "class", "svelte-1p7yyqp");
    			add_location(p1, file$4, 86, 5, 1890);
    			attr_dev(div0, "class", "col-sm col-md-7 svelte-1p7yyqp");
    			attr_dev(div0, "id", "info-col");
    			add_location(div0, file$4, 80, 4, 1667);
    			attr_dev(h4, "class", "section-head svelte-1p7yyqp");
    			add_location(h4, file$4, 93, 5, 2053);
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "form-label svelte-1p7yyqp");
    			add_location(label0, file$4, 96, 7, 2182);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "form-control svelte-1p7yyqp");
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "placeholder", "name@agency.com");
    			add_location(input0, file$4, 97, 7, 2242);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$4, 95, 6, 2156);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "form-label svelte-1p7yyqp");
    			add_location(label1, file$4, 106, 7, 2448);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control svelte-1p7yyqp");
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "placeholder", "password");
    			add_location(input1, file$4, 109, 7, 2530);
    			attr_dev(div2, "class", "mb-3");
    			add_location(div2, file$4, 105, 6, 2422);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-1p7yyqp");
    			add_location(button, file$4, 117, 6, 2708);
    			attr_dev(form, "class", "form svelte-1p7yyqp");
    			add_location(form, file$4, 94, 5, 2096);
    			attr_dev(div3, "class", "col-sm col-md-5 svelte-1p7yyqp");
    			attr_dev(div3, "id", "login-col");
    			add_location(div3, file$4, 92, 4, 2003);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$4, 79, 3, 1645);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$4, 78, 2, 1618);
    			attr_dev(hr, "class", "svelte-1p7yyqp");
    			add_location(hr, file$4, 122, 2, 2792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t3);
    			append_dev(p0, strong1);
    			append_dev(p0, t5);
    			append_dev(p0, strong2);
    			append_dev(p0, t7);
    			append_dev(p0, strong3);
    			append_dev(p0, t9);
    			append_dev(div0, t10);
    			append_dev(div0, p1);
    			append_dev(p1, t11);
    			append_dev(p1, a);
    			append_dev(p1, t13);
    			append_dev(div4, t14);
    			append_dev(div4, div3);
    			append_dev(div3, h4);
    			append_dev(div3, t16);
    			append_dev(div3, form);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t18);
    			append_dev(div1, input0);
    			set_input_value(input0, /*userLogin*/ ctx[1].email);
    			append_dev(form, t19);
    			append_dev(form, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t21);
    			append_dev(div2, input1);
    			set_input_value(input1, /*userLogin*/ ctx[1].password);
    			append_dev(form, t22);
    			append_dev(form, button);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, hr, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*signIn*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userLogin*/ 2 && input0.value !== /*userLogin*/ ctx[1].email) {
    				set_input_value(input0, /*userLogin*/ ctx[1].email);
    			}

    			if (dirty & /*userLogin*/ 2 && input1.value !== /*userLogin*/ ctx[1].password) {
    				set_input_value(input1, /*userLogin*/ ctx[1].password);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(hr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(78:1) {#if !isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let t1;
    	let listings;
    	let current;
    	const navbar_spread_levels = [/*user*/ ctx[0]];
    	let navbar_props = {};

    	for (let i = 0; i < navbar_spread_levels.length; i += 1) {
    		navbar_props = assign(navbar_props, navbar_spread_levels[i]);
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	let if_block = !/*isLoggedIn*/ ctx[2] && create_if_block$3(ctx);
    	const listings_spread_levels = [/*user*/ ctx[0]];
    	let listings_props = {};

    	for (let i = 0; i < listings_spread_levels.length; i += 1) {
    		listings_props = assign(listings_props, listings_spread_levels[i]);
    	}

    	listings = new Listings({ props: listings_props, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(listings.$$.fragment);
    			add_location(main, file$4, 74, 0, 1567);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t1);
    			mount_component(listings, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = (dirty & /*user*/ 1)
    			? get_spread_update(navbar_spread_levels, [get_spread_object(/*user*/ ctx[0])])
    			: {};

    			navbar.$set(navbar_changes);

    			if (!/*isLoggedIn*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(main, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const listings_changes = (dirty & /*user*/ 1)
    			? get_spread_update(listings_spread_levels, [get_spread_object(/*user*/ ctx[0])])
    			: {};

    			listings.$set(listings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(listings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(listings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			if (if_block) if_block.d();
    			destroy_component(listings);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let isLoggedIn;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let mockListingsAgent = [
    		{
    			name: "Taman Jesselton",
    			address: "49, Taman Jesselton, 10450 Georgetown",
    			propertyType: "Landed",
    			listingType: "Rent",
    			price: "6000",
    			isPublic: true,
    			isCompleted: false
    		},
    		{
    			name: "The Cove",
    			address: "10-55-A, The Cove, 11200 Tanjung Tokong",
    			propertyType: "Apartment",
    			listingType: "Buy",
    			price: "3000000",
    			isPublic: true,
    			isCompleted: false
    		},
    		{
    			name: "Skyhome Condo",
    			address: "1-3-7A Skyhome, Jalan Lembah Permai 4, 11200 Tanjung Tokong",
    			propertyType: "Apartment",
    			listingType: "Rental",
    			price: "4500",
    			isPublic: false,
    			isCompleted: false
    		},
    		{
    			name: "Mansion Five",
    			address: "No. 8 Solok Peirce, 10350 Georgetown",
    			propertyType: "Landed",
    			listingType: "Buy",
    			price: "12000000",
    			isPublic: true,
    			isCompleted: true
    		}
    	];

    	//set when user logs in
    	let user = {
    		// id: "AGENT", //TEMP
    		// listings: mockListingsAgent, //TEMP
    		id: "", //TEMP
    		listings: mockListingsAgent.filter(l => l.isPublic), //TEMP
    		
    	};

    	let userLogin = { email: "", password: "" };

    	function signIn(e) {
    		if (userLogin.email === "agent@agent.com" && userLogin.password === "agent") {
    			$$invalidate(0, user.id = "AGENT", user);
    			$$invalidate(0, user.listings = mockListingsAgent, user);
    		} else if (userLogin.email === "owner@owner.com" && userLogin.password === "owner") {
    			$$invalidate(0, user.id = "OWNER", user);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		userLogin.email = this.value;
    		$$invalidate(1, userLogin);
    	}

    	function input1_input_handler() {
    		userLogin.password = this.value;
    		$$invalidate(1, userLogin);
    	}

    	$$self.$capture_state = () => ({
    		Navbar,
    		Listings,
    		mockListingsAgent,
    		user,
    		userLogin,
    		signIn,
    		isLoggedIn
    	});

    	$$self.$inject_state = $$props => {
    		if ("mockListingsAgent" in $$props) mockListingsAgent = $$props.mockListingsAgent;
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    		if ("userLogin" in $$props) $$invalidate(1, userLogin = $$props.userLogin);
    		if ("isLoggedIn" in $$props) $$invalidate(2, isLoggedIn = $$props.isLoggedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*user*/ 1) {
    			$$invalidate(2, isLoggedIn = user.id !== "" && user.id !== undefined);
    		}
    	};

    	return [
    		user,
    		userLogin,
    		isLoggedIn,
    		signIn,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {

    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
