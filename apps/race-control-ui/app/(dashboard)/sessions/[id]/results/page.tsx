import React from 'react';

async function SessionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <pre>{id}</pre>
    </div>
  );
}

export default SessionResultsPage;
