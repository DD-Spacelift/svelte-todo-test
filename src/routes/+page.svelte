<script lang="ts">
    import TodoLists from '$lib/components/TodoLists.svelte';
</script>

<div class="bg-base-200">
    <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row items-center gap-8">
            <img
                src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
                class="w-48 rounded-lg shadow-xl"
            />
            <div class="text-center md:text-left">
                <h1 class="text-4xl font-bold">DD Todo demo app!</h1>
                <p class="mt-2">
                    Here you can find the best Todo apps in demo space, ever created.
                </p>
            </div>
        </div>
    </div>
</div>

<TodoLists />