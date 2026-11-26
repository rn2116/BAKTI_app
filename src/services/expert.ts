import { prisma } from "@/lib/prisma"
import type { ExpertVerificationStatus } from "@/types"
import type {
  CuratorProposalSummary,
  DictionaryEntryDTO,
} from "@/services/dictionary"

export interface ExpertProfileDTO {
  id: string
  fullName: string
  email: string
  isActive: boolean
  domicileRegency: string | null
  institutionName: string | null
  expertStatus: ExpertVerificationStatus
  expertLanguage: string | null
  expertAffiliation: string | null
  expertProofType: string | null
  expertProofNumber: string | null
  expertProofFileUrl: string | null
  expertTrackRecord: string | null
  expertReviewNotes: string | null
  createdAt: Date
  stats: {
    authoredPublishedCount: number
    curatedProposalsCount: number
    approvedCommunityProposalsCount: number
    audioDocumentedCount: number
    pendingQueueCount: number
  }
}

export interface ExpertCurationQueueData extends CuratorProposalSummary {
  expertLanguage: string | null
  totalPublishedEntries: number
  totalWithAudio: number
}

export async function getPendingCurationCount(): Promise<number> {
  return prisma.characterMatrix.count({
    where: { verificationStatus: "PENDING_REVIEW" },
  })
}

export async function getExpertProfileSummary(
  userId: string
): Promise<ExpertProfileDTO | null> {
  const [
    user,
    authoredPublishedCount,
    curatedProposalsCount,
    approvedCommunityProposalsCount,
    audioDocumentedCount,
    pendingQueueCount,
  ] = await Promise.all([
    prisma.masterUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        domicileRegency: true,
        institutionName: true,
        expertStatus: true,
        expertLanguage: true,
        expertAffiliation: true,
        expertProofType: true,
        expertProofNumber: true,
        expertProofFileUrl: true,
        expertTrackRecord: true,
        expertReviewNotes: true,
        createdAt: true,
      },
    }),
    prisma.characterMatrix.count({
      where: {
        createdBy: userId,
        verificationStatus: "APPROVED",
      },
    }),
    prisma.characterMatrix.count({
      where: {
        verifiedBy: userId,
        proposedBy: { not: null },
        verificationStatus: { in: ["APPROVED", "REJECTED"] },
      },
    }),
    prisma.characterMatrix.count({
      where: {
        verifiedBy: userId,
        proposedBy: { not: null },
        verificationStatus: "APPROVED",
      },
    }),
    prisma.characterMatrix.count({
      where: {
        verificationStatus: "APPROVED",
        audioUrl: { not: null },
        OR: [{ createdBy: userId }, { verifiedBy: userId }],
      },
    }),
    getPendingCurationCount(),
  ])

  if (!user) return null

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    isActive: user.isActive,
    domicileRegency: user.domicileRegency,
    institutionName: user.institutionName,
    expertStatus: user.expertStatus,
    expertLanguage: user.expertLanguage,
    expertAffiliation: user.expertAffiliation,
    expertProofType: user.expertProofType,
    expertProofNumber: user.expertProofNumber,
    expertProofFileUrl: user.expertProofFileUrl,
    expertTrackRecord: user.expertTrackRecord,
    expertReviewNotes: user.expertReviewNotes,
    createdAt: user.createdAt,
    stats: {
      authoredPublishedCount,
      curatedProposalsCount,
      approvedCommunityProposalsCount,
      audioDocumentedCount,
      pendingQueueCount,
    },
  }
}

export async function getExpertCurationQueue(
  expertLanguage?: string | null
): Promise<ExpertCurationQueueData> {
  const [
    rows,
    pendingCount,
    approvedCommunityCount,
    rejectedCount,
    totalPublishedEntries,
    totalWithAudio,
  ] = await Promise.all([
    prisma.characterMatrix.findMany({
      where: {
        OR: [
          { proposedBy: { not: null } },
          { verificationStatus: "PENDING_REVIEW" },
        ],
      },
      select: {
        id: true,
        indonesianCharacter: true,
        regionalLanguage: true,
        regionalTerm: true,
        characterSource: true,
        implementation: true,
        audioUrl: true,
        verificationStatus: true,
        reviewNotes: true,
        createdAt: true,
        proposer: {
          select: {
            id: true,
            fullName: true,
            participantCategory: true,
            domicileRegency: true,
            school: {
              select: {
                regency: { select: { name: true } },
              },
            },
          },
        },
        verifier: {
          select: {
            id: true,
            fullName: true,
            role: true,
            expertAffiliation: true,
            expertLanguage: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.characterMatrix.count({
      where: { verificationStatus: "PENDING_REVIEW" },
    }),
    prisma.characterMatrix.count({
      where: { proposedBy: { not: null }, verificationStatus: "APPROVED" },
    }),
    prisma.characterMatrix.count({
      where: { proposedBy: { not: null }, verificationStatus: "REJECTED" },
    }),
    prisma.characterMatrix.count({
      where: { verificationStatus: "APPROVED" },
    }),
    prisma.characterMatrix.count({
      where: { verificationStatus: "APPROVED", audioUrl: { not: null } },
    }),
  ])

  const normalizedExpertLang = (expertLanguage || "").trim().toUpperCase()

  const mapped: DictionaryEntryDTO[] = rows.map((row) => ({
    id: row.id,
    indonesianCharacter: row.indonesianCharacter,
    regionalLanguage: row.regionalLanguage,
    regionalTerm: row.regionalTerm,
    characterSource: row.characterSource,
    implementation: row.implementation,
    audioUrl: row.audioUrl,
    verificationStatus: row.verificationStatus,
    reviewNotes: row.reviewNotes,
    createdAt: row.createdAt,
    proposer: row.proposer
      ? {
          id: row.proposer.id,
          fullName: row.proposer.fullName,
          participantCategory: row.proposer.participantCategory,
          regencyName:
            row.proposer.domicileRegency ??
            row.proposer.school?.regency?.name ??
            null,
        }
      : null,
    verifier: row.verifier
      ? {
          id: row.verifier.id,
          fullName: row.verifier.fullName,
          role: row.verifier.role,
          expertAffiliation: row.verifier.expertAffiliation,
          expertLanguage: row.verifier.expertLanguage,
        }
      : null,
  }))

  // Utamakan antrean PENDING_REVIEW lalu bahasa keahlian Ahli Bahasa tersebut
  mapped.sort((a, b) => {
    const aPending = a.verificationStatus === "PENDING_REVIEW" ? 0 : 1
    const bPending = b.verificationStatus === "PENDING_REVIEW" ? 0 : 1
    if (aPending !== bPending) return aPending - bPending

    if (normalizedExpertLang) {
      const aMatch = normalizedExpertLang.includes(a.regionalLanguage.toUpperCase())
        ? 0
        : 1
      const bMatch = normalizedExpertLang.includes(b.regionalLanguage.toUpperCase())
        ? 0
        : 1
      if (aMatch !== bMatch) return aMatch - bMatch
    }

    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  return {
    proposals: mapped,
    counts: {
      pending: pendingCount,
      approved: approvedCommunityCount,
      rejected: rejectedCount,
    },
    expertLanguage: expertLanguage ?? null,
    totalPublishedEntries,
    totalWithAudio,
  }
}
