export default function AlquilerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-[#E8E4DE] rounded-[10px]" />
      <div className="flex gap-1 border-b border-[#E8E4DE]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 bg-[#E8E4DE] rounded-[6px]" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-[#E8E4DE] rounded-[16px]"
          />
        ))}
      </div>
      <div className="h-64 bg-[#E8E4DE] rounded-[16px]" />
    </div>
  );
}
