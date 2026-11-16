import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProfile, myPersonKey } from './api'
export function F3PersonProfilePage(){
 const {clanId='',personId=''}=useParams()
 const result=useQuery({queryKey:['f3-profile',clanId,personId],queryFn:()=>getProfile(clanId,personId)})
 if(result.isLoading)return <p>Đang tải hồ sơ...</p>
 if(!result.data)return <p role="alert">Không thể tải hồ sơ.</p>
 const p=result.data
 const safeMap=p.burialMapUrl && /^https?:\/\//i.test(p.burialMapUrl)
 const relation=(people:{personId:string;fullName:string}[])=>people.map(x=><Link className="block min-h-14 underline" key={x.personId} to={`/clans/${clanId}/persons/${x.personId}`}>{x.fullName}</Link>)
 return <article className="space-y-5 text-lg"><h1 className="text-3xl font-bold">{p.fullName}</h1>{p.portraitUrl&&<img className="h-56 rounded object-cover" src={p.portraitUrl} alt={p.fullName}/>}<p>Đời {p.generation} — {p.branchName}</p>{p.isRedacted&&<p>Thông tin được giới hạn theo quyền riêng tư.</p>}<p>Sinh: {p.birthDateDisplay}</p><p>Mất: {p.deathDateDisplay}</p><p className="whitespace-pre-wrap">{p.biography}</p><p>{p.phoneNumber}</p><p>Nơi an táng: {p.burialPlace}</p>{safeMap&&<a className="block min-h-14 underline" href={p.burialMapUrl} target="_blank" rel="noopener noreferrer">Mở bản đồ</a>}<h2 className="text-2xl">Gia đình</h2>{p.father&&relation([p.father])}{relation(p.spouses)}{relation(p.children)}<div className="flex flex-wrap gap-4">{p.photos.map(x=><figure key={x.id}><img className="h-40" src={x.url} alt={x.caption||'Ảnh gia đình'}/><figcaption>{x.caption}</figcaption></figure>)}</div><button className="min-h-14 rounded bg-amber-100 px-4" onClick={()=>{localStorage.setItem(myPersonKey(clanId),personId);alert('Đã đặt làm Tôi trong dòng họ này.')}}>Đặt người này làm Tôi</button><Link className="block min-h-14 underline" to={`/kinship?clanId=${clanId}&to=${personId}`}>Tra xưng hô với người này</Link><Link className="block min-h-14 underline" to={`/approvals?propose=UpdatePerson&clanId=${clanId}&personId=${personId}`}>Đề xuất chỉnh sửa thông tin</Link><Link className="block min-h-14 underline" to="/persons">Tìm người khác</Link></article>
}
