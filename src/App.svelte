<script>
	import Navbar from "./Navbar.svelte";

	//set when user logs in
	let user = {
		id: "",
	};
	let userLogin = {
		email: "",
		password: "",
	};

	$: isLoggedIn = user.id !== "" && user.id !== undefined;

	function signIn(e) {
		e.preventDefault();
		if (userLogin.email === "agent@agent.com" && userLogin.password === "agent") {
			user.id = "AGENT"
		} else if (
			userLogin.email === "owner@owner.com" &&
			userLogin.password === "owner"
		) {
			user.id = "OWNER"
		}
	}
</script>

<main>
	<Navbar {...user} />
	<div class="container">
		{#if !isLoggedIn}
			<div class="row">
				<div class="col-sm col-md-8" id="info-col">
					<h1 class="brand">RELM</h1>
					<p>
						<strong>R</strong>eal <strong>E</strong>state
						<strong>L</strong>isting <strong>M</strong>anager.
					</p>
					<p>
						Designed by <a href="https://myika.co"
							>Myika Technologies</a
						>.
					</p>
				</div>
				<div class="col-sm col-md-4" id="login-col">
					<h4 class="section-head">Sign In</h4>
					<form class="form" action="#" on:submit={signIn}>
						<div class="mb-3">
							<label for="email" class="form-label"> Email</label>
							<input
								type="email"
								class="form-control"
								id="email"
								placeholder="name@agency.com"
								bind:value={userLogin.email}
							/>
						</div>
						<div class="mb-3">
							<label for="password" class="form-label">
								Password</label
							>
							<input
								type="text"
								class="form-control"
								id="password"
								placeholder="password"
								bind:value={userLogin.password}
							/>
						</div>
						<button type="submit">Sign In</button>
					</form>
				</div>
			</div>
		{:else}
			<h1>Logged in!</h1>
		{/if}
	</div>
</main>

<style type="text/scss">
	@import "./styles/_all";

	#info-col {
		text-align: center;
		padding: 3rem;
		font-size: large;
	}
	strong {
		color: $blue;
	}
	#login-col {
		text-align: left;
		padding: 4rem auto;
	}
</style>
