<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let todoList: {
        id: number;
        title: string;
        items: Array<{
            id: number;
            text: string;
            completed: boolean;
        }>;
    } = {
        id: Number($page.params.id),
        title: '',
        items: []
    };

    onMount(async () => {
        const response = await fetch(`/api/lists/${todoList.id}`);
        if (response.ok) {
            todoList = await response.json();
        }
    });

    async function addTodo() {
        const text = prompt('Enter new todo:');
        if (text) {
            const response = await fetch(`/api/lists/${todoList.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            
            const newItem = await response.json();
            todoList.items = [...todoList.items, newItem];
        }
    }

    async function toggleTodo(id: number, completed: boolean) {
        await fetch(`/api/lists/${todoList.id}/items`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed })
        });
    }

    async function deleteTodo(id: number) {
        await fetch(`/api/lists/${todoList.id}/items`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        todoList.items = todoList.items.filter(item => item.id !== id);
    }
</script>

<div class="p-8">
    <div class="flex items-center gap-4 mb-8">
        <a href="/" class="btn btn-ghost">← Back to Lists</a>
        <h1 class="text-4xl font-bold">{todoList.title}</h1>
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <ul class="space-y-4">
                {#each todoList.items as item}
                    <li class="flex items-center gap-4">
                        <input 
                            type="checkbox" 
                            checked={item.completed} 
                            on:change={(e) => toggleTodo(item.id, e.currentTarget.checked)}
                            class="checkbox" 
                        />
                        <span class:line-through={item.completed}>
                            {item.text}
                        </span>
                        <button 
                            class="btn btn-ghost btn-sm ml-auto"
                            on:click={() => deleteTodo(item.id)}
                        >
                            ✕
                        </button>
                    </li>
                {/each}
            </ul>

            <div class="mt-6">
                <button class="btn btn-primary" on:click={addTodo}>
                    Add New Todo
                </button>
            </div>
        </div>
    </div>
</div> 