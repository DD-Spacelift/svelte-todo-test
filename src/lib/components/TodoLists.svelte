<script lang="ts">
    import { onMount } from 'svelte';

    interface TodoItem {
        id: number;
        text: string;
        completed: boolean;
        due_date: string | null;
    }

    let todoLists: Array<{
        id: number;
        title: string;
        description: string;
        items: TodoItem[];
    }> = [];

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
        const response = await fetch('/api/lists');
        todoLists = await response.json();
    });

    async function createNewList() {
        const title = prompt('Enter list title:');
        const description = prompt('Enter list description:');
        
        if (title && description) {
            const response = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });
            
            const newList = await response.json();
            todoLists = [...todoLists, newList];
        }
    }
</script>

<div class="p-8">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold">Your Todo Lists</h2>
        <button class="btn btn-primary" on:click={createNewList}>
            Create New List
        </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each todoLists as list}
            <a href="/todos/{list.id}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div class="card-body">
                    <h3 class="card-title">{list.title}</h3>
                    <p class="text-gray-600 mb-4">{list.description}</p>
                    
                    {#if list.items && list.items.length > 0}
                        <div class="space-y-2">
                            {#each list.items.slice(0, 3) as item}
                                <div class="flex items-center gap-2 text-sm">
                                    <span class="w-4 h-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                                        </svg>
                                    </span>
                                    <span>{item.text}</span>
                                    {#if item.due_date}
                                        <span 
                                            class="ml-auto px-2 py-0.5 text-xs rounded"
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
                            {/each}
                            {#if list.items.length > 3}
                                <div class="text-sm text-gray-500">
                                    +{list.items.length - 3} more incomplete items
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <p class="text-sm text-gray-500">No incomplete items in this list</p>
                    {/if}

                    <div class="card-actions justify-end mt-4">
                        <button class="btn btn-primary">View List</button>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div> 