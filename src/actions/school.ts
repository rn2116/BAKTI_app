"use server"
import {
  getSchools as svcGetSchools,
  getClassesBySchool as svcGetClassesBySchool,
} from "@/services/school"

export async function getSchools() {
  return svcGetSchools()
}

export async function getClassesBySchool(schoolId: string) {
  return svcGetClassesBySchool(schoolId)
}
