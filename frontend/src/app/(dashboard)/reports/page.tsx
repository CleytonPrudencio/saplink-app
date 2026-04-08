"use client";

const reports = [
  {
    title: "Relatorio Mensal",
    description:
      "Visao geral mensal da saude das integracoes, alertas resolvidos e metricas de performance.",
  },
  {
    title: "Analise de Migracao",
    description:
      "Relatorio detalhado para projetos de migracao SAP, incluindo riscos e recomendacoes.",
  },
  {
    title: "ROI Report",
    description:
      "Analise de retorno sobre investimento com base em alertas prevenidos e tempo economizado.",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatorios</h1>
      <p className="text-[#9b95ad]">Relatorios white-label em breve.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div
            key={report.title}
            className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{report.title}</h3>
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                Em breve
              </span>
            </div>
            <p className="text-sm text-[#9b95ad]">{report.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
