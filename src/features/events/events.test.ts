import { expect,it } from 'vitest'
import { lunarMonthName } from './EventsPage'
it('gọi tháng Giêng và tháng Chạp',()=>{expect(lunarMonthName(1)).toBe('Tháng Giêng');expect(lunarMonthName(12)).toBe('Tháng Chạp')})
