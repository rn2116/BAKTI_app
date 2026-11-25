import { prisma } from "@/lib/prisma"
import type { QuestionVerificationStatus } from "@/types"

export interface DictionaryContributorInfo {
  id: string
  fullName: string
  participantCategory: string | null
  regencyName: string | null
}

export interface DictionaryVerifierInfo {
  id: string
  fullName: string
  role: string
  expertAffiliation: string | null
  expertLanguage: string | null
}

export interface DictionaryEntryDTO {
  id: number
  indonesianCharacter: string
  regionalLanguage: string
  regionalTerm: string
  characterSource: string
  implementation: string
  audioUrl: string | null
  verificationStatus: QuestionVerificationStatus
  reviewNotes: string | null
  createdAt: Date
  proposer: DictionaryContributorInfo | null
  verifier: DictionaryVerifierInfo | null
}

export interface UserProposedEntryDTO {
  id: number
  indonesianCharacter: string
  regionalLanguage: string
  regionalTerm: string
  characterSource: string
  implementation: string
  verificationStatus: QuestionVerificationStatus
  reviewNotes: string | null
  createdAt: Date
  verifier: {
    fullName: string
    expertAffiliation: string | null
  } | null
}

export interface CuratorProposalSummary {
  proposals: DictionaryEntryDTO[]
  counts: {
    pending: number
    approved: number
    rejected: number
  }
}

export async function getApprovedDictionaryEntries(): Promise<DictionaryEntryDTO[]> {
  const rows = await prisma.characterMatrix.findMany({
    where: { verificationStatus: "APPROVED" },
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
    orderBy: [{ regionalLanguage: "asc" }, { indonesianCharacter: "asc" }],
  })

  return rows.map((row) => ({
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
            row.proposer.domicileRegency ?? row.proposer.school?.regency?.name ?? null,
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
}

export async function getUserProposedEntries(
  userId: string
): Promise<UserProposedEntryDTO[]> {
  return prisma.characterMatrix.findMany({
    where: { proposedBy: userId },
    select: {
      id: true,
      indonesianCharacter: true,
      regionalLanguage: true,
      regionalTerm: true,
      characterSource: true,
      implementation: true,
      verificationStatus: true,
      reviewNotes: true,
      createdAt: true,
      verifier: {
        select: {
          fullName: true,
          expertAffiliation: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPendingDictionaryProposalsForCurator(
  expertLanguage?: string | null
): Promise<CuratorProposalSummary> {
  const [rows, pendingCount, approvedCommunityCount, rejectedCount] = await Promise.all([
    prisma.characterMatrix.findMany({
      where: {
        proposedBy: { not: null },
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
            row.proposer.domicileRegency ?? row.proposer.school?.regency?.name ?? null,
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

  // Prioritaskan PENDING_REVIEW serta bahasa keahlian ahli bahasa
  mapped.sort((a, b) => {
    const aPending = a.verificationStatus === "PENDING_REVIEW" ? 0 : 1
    const bPending = b.verificationStatus === "PENDING_REVIEW" ? 0 : 1
    if (aPending !== bPending) return aPending - bPending

    if (normalizedExpertLang) {
      const aMatch = normalizedExpertLang.includes(a.regionalLanguage.toUpperCase()) ? 0 : 1
      const bMatch = normalizedExpertLang.includes(b.regionalLanguage.toUpperCase()) ? 0 : 1
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
  }
}
