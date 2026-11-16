import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { PersonsPage } from '@/features/persons/PersonsPage'
import { F3PersonProfilePage } from './PersonProfilePage'
vi.mock('@/lib/api/clans',()=>({getClans:vi.fn().mockResolvedValue([])}))
vi.mock('./api',()=>({getProfile:vi.fn().mockRejectedValue(new Error('missing')),myPersonKey:(id:string)=>`vgms_my_person_${id}`}))
const wrap=(page:React.ReactNode)=>render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>)
describe('Luồng 3 hồ sơ',()=>{
 it('hiện tìm kiếm và bộ lọc',()=>{wrap(<PersonsPage/>);expect(screen.getByText('Thành viên dòng họ')).toBeInTheDocument();expect(screen.getByPlaceholderText('Nhập tên có dấu hoặc không dấu')).toBeInTheDocument()})
 it('báo lỗi khi hồ sơ không thể tải',async()=>{wrap(<F3PersonProfilePage/>);expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải hồ sơ')})
})
