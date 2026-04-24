export default function Logo({ size = "md", white = false, stacked = false }) {
  const imgSizes = { xs: "h-8", sm: "h-10", md: "h-14", lg: "h-20", xl: "h-32" };
  const txtSizes = { xs: "text-sm", sm: "text-base", md: "text-xl", lg: "text-2xl", xl: "text-4xl" };

  if (stacked) {
    return (
      <div className="flex flex-col items-start gap-1">
        <img
          src="/logo_nova.png"
          alt="SobrePressão"
          className={`${imgSizes[size]} w-auto`}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <span className={`font-extrabold ${txtSizes[size]} ${white ? "text-white" : "text-brand-dark"} leading-none`}>
          Sobre<span className="text-brand-orange">Pressão</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo_nova.png"
        alt="SobrePressão"
        className={`${imgSizes[size]} w-auto`}
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <span className={`font-extrabold ${txtSizes[size]} ${white ? "text-white" : "text-brand-dark"}`}>
        Sobre<span className="text-brand-orange">Pressão</span>
      </span>
    </div>
  );
}
