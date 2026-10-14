/** Announcement strip: everything shown is sample data and nothing can be ordered. */
export function SampleDataNotice() {
  return (
    <div role="note" className="bg-ink px-5 py-2.5 text-center text-xs leading-relaxed tracking-wide text-ivory">
      <span className="font-medium">Catalogue preview</span>
      <span className="sr-only">: </span>
      <span aria-hidden="true" className="mx-2 text-sand">
        ·
      </span>
      All products, prices and stock levels shown are sample data. Nothing can be ordered yet.
    </div>
  );
}
