<script lang="ts">
    import type { User } from "../types";
    import delete_icon from '../../media/icons8-delete-48.png';

    export let user: User;
    export let accessToken: string;
    let text = "";
    let todos: Array<{ text: string; completed: boolean; _id: number }> = [];

    async function addTodo(t: string) {
        const response = await fetch(`${apiBaseUrl}/todo`, {
            method: "POST",
            body: JSON.stringify({
                text: t,
            }),
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${accessToken}`,
            },
        });
        const { todo } = await response.json();
        todos = [todo, ...todos];
    }

    async function deleteTodo(id: number) {
        console.log("deleting todo", id);
        await fetch(`${apiBaseUrl}/todo`, {
            method: "DELETE",
            body: JSON.stringify({
                id: id,
            }),
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${accessToken}`,
            },
        });
        todos = todos.filter(todo => todo._id !== id);
    }

    async function handleMessage(event: MessageEvent) {
            const message = event.data;
            switch (message.type) {
                case "new-todo":
                    addTodo(message.value);
                    break;
            }
        }
        window.addEventListener("message", handleMessage);

        let todosRequested = false;

$: {
    // When the token has not been requested yet, send the "get-token" message
    if (!todosRequested) {
        async function getTodos() {
        const response = await fetch(`${apiBaseUrl}/todo`, {
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
        const payload = await response.json();
        todos = payload.todos;
    }
        getTodos();
        todosRequested = true;
    }
}
</script>

<style>
    .complete {
        text-decoration: line-through;
    }
    .delete-icon {
        margin-left: 15px;
        cursor: pointer;
    }
    .delete-image {
        width: 20px;
        height: 20px;
        margin-bottom: -5px;
    }
    .todo-text {
        cursor: pointer;
        width: 80%;
    }
    .todo{
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px;
    }
    .intro {
        font-size: 20px;
        margin: 15px;
    }
</style>

<div class="intro">Hello, {user.name}</div>

<form
    on:submit|preventDefault={async () => {
        addTodo(text);
        text = '';
    }}>
    <input bind:value={text} placeholder="Enter Todo and Press ENTER"/>
</form>

<!-- <ul> -->
    {#each todos as todo, index (todo._id)}
    <div class="todo">
        <div
            class:complete={todo.completed}
            class="todo-text"
            on:click={async () => {
                todo.completed = !todo.completed;
                const response = await fetch(`${apiBaseUrl}/todo`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        id: todo._id,
                    }),
                    headers: {
                        'content-type': 'application/json',
                        authorization: `Bearer ${accessToken}`,
                    },
                });
                console.log(await response.json());
            }}>
            {index + 1}. {todo.text}
        </div>
        <div class="delete-icon" on:click={() => deleteTodo(todo._id)}><img class="delete-image" src={delete_icon}/></div>
    </div>
    {/each}
<!-- </ul> -->

<!-- <ul>
    {#each todos as todo, index (todo._id)}
        <li class:complete={todo.completed}>
            {index + 1}. {todo.text}
            <span class="delete-icon" on:click={() => deleteTodo(todo._id)}>🗑️</span>
            <span on:click={async () => {
                todo.completed = !todo.completed;
                const response = await fetch(`${apiBaseUrl}/todo`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        id: todo._id,
                    }),
                    headers: {
                        'content-type': 'application/json',
                        authorization: `Bearer ${accessToken}`,
                    },
                });
                console.log(await response.json());
            }}>
                [Toggle]
            </span>
        </li>
    {/each}
</ul> -->
