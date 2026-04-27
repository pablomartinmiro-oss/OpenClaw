interface LegalShellProps {
  title: string;
  tenantName: string;
  updatedAt: string;
  children: React.ReactNode;
}

export function LegalShell({
  title,
  tenantName,
  updatedAt,
  children,
}: LegalShellProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        <p className="text-xs text-gray-500">
          {tenantName} · Última actualización: {updatedAt}
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700">
        {children}
      </div>
    </div>
  );
}
