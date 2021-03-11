import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, v as validate_slots, e as element, b as space, t as text, c as claim_element, f as children, h as detach_dev, j as claim_space, g as claim_text, k as attr_dev, l as add_location, m as insert_dev, n as append_dev, I as set_data_dev, D as noop, p as listen_dev, r as run_all } from './client.06c419df.js';

/* src/routes/ListingLI.svelte generated by Svelte v3.35.0 */
const file = "src/routes/ListingLI.svelte";

// (52:12) {:else}
function create_else_block(ctx) {
	let button;
	let t;

	const block = {
		c: function create() {
			button = element("button");
			t = text("Learn More");
			this.h();
		},
		l: function claim(nodes) {
			button = claim_element(nodes, "BUTTON", { class: true });
			var button_nodes = children(button);
			t = claim_text(button_nodes, "Learn More");
			button_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(button, "class", "svelte-1dbz1tu");
			add_location(button, file, 52, 16, 1780);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(52:12) {:else}",
		ctx
	});

	return block;
}

// (25:12) {#if id && id !== ""}
function create_if_block(ctx) {
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
			this.h();
		},
		l: function claim(nodes) {
			div0 = claim_element(nodes, "DIV", { class: true });
			var div0_nodes = children(div0);

			input0 = claim_element(div0_nodes, "INPUT", {
				class: true,
				type: true,
				id: true,
				value: true
			});

			div0_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			div1 = claim_element(nodes, "DIV", { class: true });
			var div1_nodes = children(div1);

			input1 = claim_element(div1_nodes, "INPUT", {
				class: true,
				type: true,
				id: true,
				value: true
			});

			div1_nodes.forEach(detach_dev);
			t1 = claim_space(nodes);
			div2 = claim_element(nodes, "DIV", { class: true });
			var div2_nodes = children(div2);

			input2 = claim_element(div2_nodes, "INPUT", {
				class: true,
				type: true,
				id: true,
				value: true
			});

			div2_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(input0, "class", "form-check-input svelte-1dbz1tu");
			attr_dev(input0, "type", "checkbox");
			attr_dev(input0, "id", "inlineCheckbox1");
			input0.__value = "option1";
			input0.value = input0.__value;
			add_location(input0, file, 26, 20, 790);
			attr_dev(div0, "class", "form-check form-check-inline");
			add_location(div0, file, 25, 16, 727);
			attr_dev(input1, "class", "form-check-input svelte-1dbz1tu");
			attr_dev(input1, "type", "checkbox");
			attr_dev(input1, "id", "inlineCheckbox2");
			input1.__value = "option2";
			input1.value = input1.__value;
			add_location(input1, file, 35, 20, 1152);
			attr_dev(div1, "class", "form-check form-check-inline");
			add_location(div1, file, 34, 16, 1089);
			attr_dev(input2, "class", "form-check-input svelte-1dbz1tu");
			attr_dev(input2, "type", "checkbox");
			attr_dev(input2, "id", "inlineCheckbox3");
			input2.value = "option3";
			add_location(input2, file, 44, 20, 1517);
			attr_dev(div2, "class", "form-check form-check-inline");
			add_location(div2, file, 43, 16, 1454);
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
		id: create_if_block.name,
		type: "if",
		source: "(25:12) {#if id && id !== \\\"\\\"}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
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
		if (/*id*/ ctx[1] && /*id*/ ctx[1] !== "") return create_if_block;
		return create_else_block;
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
			this.h();
		},
		l: function claim(nodes) {
			div4 = claim_element(nodes, "DIV", { class: true });
			var div4_nodes = children(div4);
			div3 = claim_element(div4_nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			div0 = claim_element(div3_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			h1 = claim_element(div0_nodes, "H1", { class: true });
			var h1_nodes = children(h1);
			i = claim_element(h1_nodes, "I", { class: true });
			children(i).forEach(detach_dev);
			h1_nodes.forEach(detach_dev);
			div0_nodes.forEach(detach_dev);
			t0 = claim_space(div3_nodes);
			div1 = claim_element(div3_nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			h4 = claim_element(div1_nodes, "H4", { class: true });
			var h4_nodes = children(h4);
			t1 = claim_text(h4_nodes, t1_value);
			h4_nodes.forEach(detach_dev);
			t2 = claim_space(div1_nodes);
			p0 = claim_element(div1_nodes, "P", { class: true });
			var p0_nodes = children(p0);
			t3 = claim_text(p0_nodes, t3_value);
			p0_nodes.forEach(detach_dev);
			t4 = claim_space(div1_nodes);
			p1 = claim_element(div1_nodes, "P", { class: true });
			var p1_nodes = children(p1);
			t5 = claim_text(p1_nodes, "Type: ");
			t6 = claim_text(p1_nodes, t6_value);
			p1_nodes.forEach(detach_dev);
			t7 = claim_space(div1_nodes);
			p2 = claim_element(div1_nodes, "P", { class: true });
			var p2_nodes = children(p2);
			t8 = claim_text(p2_nodes, "Price: RM ");
			t9 = claim_text(p2_nodes, t9_value);
			p2_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t10 = claim_space(div3_nodes);
			div2 = claim_element(div3_nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			if_block.l(div2_nodes);
			div2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			t11 = claim_space(div4_nodes);
			hr = claim_element(div4_nodes, "HR", { class: true });
			div4_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(i, "class", "bi bi-house-door");
			add_location(i, file, 11, 16, 269);
			attr_dev(h1, "class", "svelte-1dbz1tu");
			add_location(h1, file, 11, 12, 265);
			attr_dev(div0, "class", "col-2 d-flex justify-content-center");
			add_location(div0, file, 10, 8, 203);
			attr_dev(h4, "class", "svelte-1dbz1tu");
			add_location(h4, file, 14, 12, 360);
			attr_dev(p0, "class", "svelte-1dbz1tu");
			add_location(p0, file, 15, 12, 396);
			attr_dev(p1, "class", "svelte-1dbz1tu");
			add_location(p1, file, 16, 12, 433);
			attr_dev(p2, "class", "svelte-1dbz1tu");
			add_location(p2, file, 17, 12, 480);
			attr_dev(div1, "class", "col-7");
			add_location(div1, file, 13, 8, 328);
			attr_dev(div2, "class", "col-3");
			add_location(div2, file, 23, 8, 657);
			attr_dev(div3, "class", "row");
			add_location(div3, file, 9, 4, 177);
			attr_dev(hr, "class", "svelte-1dbz1tu");
			add_location(hr, file, 56, 4, 1856);
			attr_dev(div4, "class", "container svelte-1dbz1tu");
			add_location(div4, file, 8, 0, 149);
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
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
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
		init(this, options, instance, create_fragment, safe_not_equal, { id: 1, listing: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ListingLI_1",
			options,
			id: create_fragment.name
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

export default ListingLI_1;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGluZ0xJLjE4OGNjMjdiLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcm91dGVzL0xpc3RpbmdMSS5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICAvL2ltcG9ydCB7fSBmcm9tIFwibm9kZTpvc1wiO1xuICAgIGltcG9ydCBMaXN0aW5nTEkgZnJvbSBcIi4vTGlzdGluZ0xJLnN2ZWx0ZVwiO1xuXG4gICAgZXhwb3J0IGxldCBpZDtcbiAgICBleHBvcnQgbGV0IGxpc3RpbmcgPSB7fTtcbjwvc2NyaXB0PlxuXG48ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLTIgZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxoMT48aSBjbGFzcz1cImJpIGJpLWhvdXNlLWRvb3JcIiAvPjwvaDE+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLTdcIj5cbiAgICAgICAgICAgIDxoND57bGlzdGluZy5uYW1lfTwvaDQ+XG4gICAgICAgICAgICA8cD57bGlzdGluZy5hZGRyZXNzfTwvcD5cbiAgICAgICAgICAgIDxwPlR5cGU6IHtsaXN0aW5nLmxpc3RpbmdUeXBlfTwvcD5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIFByaWNlOiBSTSB7bGlzdGluZy5wcmljZVxuICAgICAgICAgICAgICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpfVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC0zXCI+XG4gICAgICAgICAgICB7I2lmIGlkICYmIGlkICE9PSBcIlwifVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNoZWNrIGZvcm0tY2hlY2staW5saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb3JtLWNoZWNrLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cImlubGluZUNoZWNrYm94MVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIm9wdGlvbjFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZDpjaGVja2VkPXtsaXN0aW5nLmlzUHVibGljfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNoZWNrIGZvcm0tY2hlY2staW5saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb3JtLWNoZWNrLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cImlubGluZUNoZWNrYm94MlwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIm9wdGlvbjJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZDpjaGVja2VkPXtsaXN0aW5nLmlzQ29tcGxldGVkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNoZWNrIGZvcm0tY2hlY2staW5saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJmb3JtLWNoZWNrLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cImlubGluZUNoZWNrYm94M1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIm9wdGlvbjNcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgezplbHNlfVxuICAgICAgICAgICAgICAgIDxidXR0b24+TGVhcm4gTW9yZTwvYnV0dG9uPlxuICAgICAgICAgICAgey9pZn1cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGhyIC8+XG48L2Rpdj5cblxuPHN0eWxlIHR5cGU9XCJ0ZXh0L3Njc3NcIj5cbiAgICBAaW1wb3J0IFwiLi9zdHlsZXMvX2FsbFwiO1xuICAgIGRpdi5jb250YWluZXIge1xuICAgICAgICBmb250LWZhbWlseTogJGJvZHktZm9udDtcbiAgICAgICAgbWFyZ2luOiAxLjVyZW0gYXV0bztcbiAgICAgICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xuXG4gICAgICAgIHAge1xuICAgICAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5wdXQuZm9ybS1jaGVjay1pbnB1dCB7XG4gICAgICAgIG1hcmdpbjogMXJlbSAwLjc1cmVtO1xuICAgIH1cbjwvc3R5bGU+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBK0JzQyxHQUFPLElBQUMsUUFBUTs7OztnQ0FTaEIsR0FBTyxJQUFDLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7aUNBVG5CLEdBQU8sSUFBQyxRQUFROzs7O2lDQVNoQixHQUFPLElBQUMsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkExQnhDLEdBQU8sSUFBQyxJQUFJOzs7OzRCQUNiLEdBQU8sSUFBQyxPQUFPOzs7Ozs0QkFDVCxHQUFPLElBQUMsV0FBVzs7Ozs7NEJBRWQsR0FBTyxJQUFDLEtBQUEsQ0FDZCxRQUFRLEdBQ1IsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEdBQUc7Ozs7Ozs7O2FBSXhDLEdBQUUsY0FBSSxHQUFFLFFBQUssRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxRUFWZixHQUFPLElBQUMsSUFBSTtxRUFDYixHQUFPLElBQUMsT0FBTztxRUFDVCxHQUFPLElBQUMsV0FBVztxRUFFZCxHQUFPLElBQUMsS0FBQSxDQUNkLFFBQVEsR0FDUixPQUFPLENBQUMsdUJBQXVCLEVBQUUsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BaEIxQyxFQUFFO09BQ0YsT0FBTzs7Ozs7Ozs7RUEwQmdCLE9BQU8sQ0FBQyxRQUFROzs7OztFQVNoQixPQUFPLENBQUMsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
