<script lang="ts">
    import { onMount } from 'svelte';

    let todoLists: Array<{
        id: number;
        title: string;
        description: string;
    }> = [];

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
                    <p>{list.description}</p>
                    <div class="card-actions justify-end">
                        <button class="btn btn-primary">View List</button>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div> 