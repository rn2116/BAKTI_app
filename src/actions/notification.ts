"use server"

import { getCurrentUser } from "@/lib/auth"
import { getUserNotifications, AppNotification } from "@/services/notificationService"

export async function fetchMyNotifications(): Promise<AppNotification[]> {
  const user = await getCurrentUser()
  if (!user) return []
  return getUserNotifications(user.id, user.role, user.schoolId)
}
