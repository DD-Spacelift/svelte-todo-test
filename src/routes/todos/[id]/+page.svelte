<script lang="ts">
    import { page } from '$app/stores';
    
    // Sample data - this would later come from a store or backend
    const todoList = {
        id: $page.params.id,
        title: 'Sample Todo List',
        todos: [
            { id: 1, text: 'First todo item', completed: false },
            { id: 2, text: 'Second todo item', completed: true },
            { id: 3, text: 'Third todo item', completed: false }
        ]
    };
</script>

<div class="p-8">
    <div class="flex items-center gap-4 mb-8">
        <a href="/" class="btn btn-ghost">← Back to Lists</a>
        <h1 class="text-4xl font-bold">{todoList.title}</h1>
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <ul class="space-y-4">
                {#each todoList.todos as todo}
                    <li class="flex items-center gap-4">
                        <input 
                            type="checkbox" 
                            checked={todo.completed} 
                            class="checkbox" 
                        />
                        <span class:line-through={todo.completed}>
                            {todo.text}
                        </span>
                    </li>
                {/each}
            </ul>

            <div class="mt-6">
                <button class="btn btn-primary">Add New Todo</button>
            </div>
        </div>
    </div>
</div> 