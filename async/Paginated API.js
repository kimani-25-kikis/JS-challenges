let isLoading = false;
async function loadMore() {
  if (isLoading) return;
  isLoading = true;
  try {
    const res = await fetch(`/api/posts?cursor=${cursor}`);
    const { items, nextCursor } = await res.json();
    render(items);
    cursor = nextCursor;
  } finally {
    isLoading = false;
  }
}