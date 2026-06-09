import { ContainerRegistrationKeys } from "@medusajs/utils"

export function resolveKnex(scope: { resolve: (key: string) => unknown }) {
  return scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
}
