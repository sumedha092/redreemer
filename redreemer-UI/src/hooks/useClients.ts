import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/api/clients')
      return data
    },
    enabled: !MOCK_MODE,
    retry: false,
    placeholderData: []
  })
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/clients/${id}`)
      return data
    },
    enabled: !!id,
    retry: false
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/api/analytics')
      return data
    },
    retry: false,
    refetchInterval: 30000
  })
}

export function useImpact() {
  return useQuery({
    queryKey: ['impact'],
    queryFn: async () => {
      const { data } = await api.get('/api/impact')
      return data
    },
    retry: false,
    staleTime: 60000
  })
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ clientId, message }: { clientId: string; message: string }) => {
      const { data } = await api.post(`/api/clients/${clientId}/message`, { message })
      return data
    }
  })
}

export function useUpdateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ clientId, step }: { clientId: string; step: number }) => {
      const { data } = await api.patch(`/api/clients/${clientId}/step`, { step })
      return data
    },
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: ['client', clientId] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    }
  })
}

export function useAddClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (phone_number: string) => {
      const { data } = await api.post('/api/clients', { phone_number })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
    }
  })
}

export function useCrisisAlerts() {
  return useQuery({
    queryKey: ['crisis-alerts'],
    queryFn: async () => {
      const { data } = await api.get('/api/crisis-alerts')
      return data
    },
    retry: false,
    refetchInterval: 30000
  })
}

export function useRunDemo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/demo/run')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}

/**
 * Send an SMS directly via Textbelt (no auth required — demo endpoint).
 * Optionally generates a Gemini AI reply.
 */
export function useSendDirectSMS() {
  return useMutation({
    mutationFn: async ({ phone, message, generateReply = false }: { phone: string; message: string; generateReply?: boolean }) => {
      const { data } = await api.post('/api/sms/send', { phone, message, generateReply })
      return data
    }
  })
}
