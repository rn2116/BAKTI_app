import { getCurrentUser } from "@/lib/auth"
import { getQuizRecapBySchoolOrTeacher } from "@/services/admin-guru"
import { PageHeader } from "@/components/shared/PageHeader"
import { ExportExcelButton } from "@/components/guru/ExportExcelButton"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ResponsiveTable } from "@/components/shared/ResponsiveTable"
import { redirect } from "next/navigation"

export default async function GuruRekapPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "GURU") {
    redirect("/masuk")
  }

  const recapAttempts = await getQuizRecapBySchoolOrTeacher(
    user.schoolId ?? undefined,
    user.id
  )

  const exportData = recapAttempts.map((item) => ({
    nama: item.user.fullName,
    nisn: item.user.nisn ?? "-",
    sekolah: item.user.school?.name ?? "Sekolah",
    kelas: item.user.class ? `Kelas ${item.user.class.grade} - ${item.user.class.name}` : "-",
    kuis: item.quiz.title,
    kategori: item.quiz.category,
    skor: item.score,
    skorMaksimal: item.maxScore,
    status: item.passed ? "LULUS" : "REMIDI",
    tanggal: new Date(item.startedAt).toLocaleString("id-ID"),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekapitulasi Nilai Siswa"
        description="Pantau hasil pengerjaan kuis siswa dan unduh laporan resmi dalam format Excel."
        action={<ExportExcelButton data={exportData} filename="rekap-nilai-kuis-siswa.xlsx" />}
      />

      {/* 1. Mobile Stacked Cards (Layar HP < 768px) */}
      <div className="space-y-3 md:hidden">
        {recapAttempts.map((row) => (
          <Card key={row.id} className="p-4 border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-[#18181B] truncate">
                  {row.user.fullName}
                </div>
                <div className="text-[11px] text-zinc-500">
                  NISN: {row.user.nisn ?? "-"} • {row.user.class?.name ?? "-"}
                </div>
              </div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  row.passed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {row.passed ? "Lulus" : "Remidi"}
              </span>
            </div>

            <div className="border-t border-zinc-100 pt-2 flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-zinc-800 truncate">
                {row.quiz.title}
              </div>
              <div className="flex items-center justify-between text-xs">
                <CategoryBadge category={row.quiz.category} />
                <div className="font-mono font-bold text-sm text-zinc-900">
                  {row.score} / {row.maxScore}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 text-right">
              {new Date(row.startedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </Card>
        ))}

        {recapAttempts.length === 0 && (
          <div className="p-8 border border-dashed rounded-xl text-center text-xs text-zinc-500 bg-white">
            Belum ada data pengerjaan kuis.
          </div>
        )}
      </div>

      {/* 2. Desktop Full Table (Layar >= 768px) */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-semibold">
              <th className="py-3 px-4">Nama Siswa</th>
              <th className="py-3 px-4">Kelas</th>
              <th className="py-3 px-4">Kuis</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-center">Nilai</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {recapAttempts.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-zinc-900">{row.user.fullName}</div>
                  <div className="text-[10px] text-zinc-500">NISN: {row.user.nisn ?? "-"}</div>
                </td>
                <td className="py-3 px-4 text-zinc-600">
                  {row.user.class ? `${row.user.class.name}` : "-"}
                </td>
                <td className="py-3 px-4 max-w-[220px] truncate font-medium text-zinc-800">
                  {row.quiz.title}
                </td>
                <td className="py-3 px-4">
                  <CategoryBadge category={row.quiz.category} />
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-zinc-900">
                  {row.score} / {row.maxScore}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.passed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.passed ? "Lulus" : "Remidi"}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-500 text-[11px]">
                  {new Date(row.startedAt).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}

            {recapAttempts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  Belum ada siswa yang mengerjakan kuis. Data akan muncul secara otomatis.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>
    </div>
  )
}
