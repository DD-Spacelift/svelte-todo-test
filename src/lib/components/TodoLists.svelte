<script lang="ts">
    // Sample data - this would later come from a store or backend
    let todoLists = [
        { id: 1, title: 'Work Tasks', description: 'All my work-related todos' },
        { id: 2, title: 'Shopping List', description: 'Things to buy' },
        { id: 3, title: 'Personal Goals', description: 'Personal development tasks' }
    ];
</script>

<div class="p-8">
    <h2 class="text-3xl font-bold mb-6">Your Todo Lists</h2>
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