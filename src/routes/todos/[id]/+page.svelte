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
            due_date: string | null;
        }>;
    } = {
        id: Number($page.params.id),
        title: '',
        items: []
    };

    function getDueStatus(dueDate: string | null) {
        if (!dueDate) return null;
        
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 2) return 'soon';
        return 'ok';
    }

    function formatDate(date: string | null) {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    }

    onMount(async () => {
        const response = await fetch(`/api/lists/${todoList.id}`);
        if (response.ok) {
            todoList = await response.json();
        }
    });

    async function addTodo() {
        const text = prompt('Enter new todo:');
        if (!text) return;
        
        const dueDate = prompt('Enter due date (YYYY-MM-DD) or leave empty:');
        const validDate = dueDate ? new Date(dueDate) : null;
        
        if (dueDate && isNaN(validDate?.getTime() || 0)) {
            alert('Invalid date format. Please use YYYY-MM-DD');
            return;
        }

        const response = await fetch(`/api/lists/${todoList.id}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, dueDate: validDate?.toISOString() || null })
        });
        
        const newItem = await response.json();
        todoList.items = [...todoList.items, newItem];
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
                        <div class="flex-1">
                            <span class:line-through={item.completed}>
                                {item.text}
                            </span>
                            {#if item.due_date}
                                <span 
                                    class="ml-2 px-2 py-1 text-sm rounded"
                                    class:bg-red-100={getDueStatus(item.due_date) === 'overdue'}
                                    class:text-red-700={getDueStatus(item.due_date) === 'overdue'}
                                    class:bg-yellow-100={getDueStatus(item.due_date) === 'soon'}
                                    class:text-yellow-700={getDueStatus(item.due_date) === 'soon'}
                                    class:bg-green-100={getDueStatus(item.due_date) === 'ok'}
                                    class:text-green-700={getDueStatus(item.due_date) === 'ok'}
                                >
                                    Due: {formatDate(item.due_date)}
                                </span>
                            {/if}
                        </div>
                        <button 
                            class="btn btn-ghost btn-sm"
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