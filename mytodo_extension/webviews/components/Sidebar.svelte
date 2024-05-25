<script lang="ts">
    import type { User } from "../types";
    import Todos from "./Todos.svelte";

    let accessToken = "";
    let loading = true;
    let user: User | null = null;
    let page: "todos" | "contact" = tsvscode.getState()?.page || "todos";

    $: {
        tsvscode.setState({ page });
    }
    let tokenRequested = false;

$: {
    // When the token has not been requested yet, send the "get-token" message
    if (!tokenRequested) {
        console.log("sending get-token message");
        tsvscode.postMessage({ type: "get-token", value: undefined });
        tokenRequested = true;
    }
}

async function handleMessage(event: MessageEvent) {
    const message = event.data;
    console.log("message received in sidebar", message);
    switch (message.type) {
        case "token":
            accessToken = message.value;
            console.log("in sidebar", accessToken);
            const response = await fetch(`${apiBaseUrl}/me`, {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            user = data.user;
            console.log("user in sidebar", user)
            loading = false;
            break;
    }
}

window.addEventListener("message", handleMessage);
</script>

{#if loading}
    <div>loading please wait...</div>
{:else if user}
    {#if page === 'todos'}
        <Todos {user} {accessToken} />
        <button
            on:click={() => {
                page = 'contact';
            }}>go to contact</button>
    {:else}
        <div>Contact me here: <a href="mailto:udaybiswasofficial@gmail.com">udaybiswasofficial@gmail.com</a></div>
        <button
            on:click={() => {
                page = 'todos';
            }}>go back</button>
    {/if}
    <button
        on:click={() => {
            accessToken = '';
            user = null;
            tsvscode.postMessage({ type: 'logout', value: undefined });
        }}>logout</button>
{:else}
    <div>please login to see your todos</div>
    <button
        on:click={() => {
            tsvscode.postMessage({ type: 'authenticate', value: undefined });
        }}>login with GitHub</button>
{/if}