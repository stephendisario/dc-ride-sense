export const PanelHeader = ({ label, title }: { label: string; title: string }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <h2 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h2>
  </div>
);
