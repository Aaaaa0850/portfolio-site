import { useState } from 'react';
export interface Skill {
    name: string;
    category: string;
    description: string;
    icon?: string;
}

interface Props { skills: Skill[] }

export default function SkillsExplorer({ skills }: Props) {
    const categories = [...new Set(skills.map(skill => skill.category))];
    const [category, setCategory] = useState('すべて');
    const [query, setQuery] = useState('');
    const normalized = query.trim().toLocaleLowerCase();
    const filtered = skills.filter(skill =>
        (category === 'すべて' || skill.category === category) &&
        `${skill.name} ${skill.category} ${skill.description}`.toLocaleLowerCase().includes(normalized)
    );

    return <div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="カテゴリ">
            {['すべて', ...categories].map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className="border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white">{item}</button>)}
        </div>
        <label className="mt-6 block text-sm" htmlFor="skill-search">スキルを検索</label>
        <input id="skill-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="技術名・キーワード" className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2" />
        <div className="my-6 flex items-center justify-between gap-4">
            <p role="status" className="text-sm text-neutral-500">{filtered.length} 件</p>
            <button type="button" onClick={() => { setCategory('すべて'); setQuery(''); }} className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">リセット</button>
        </div>
        {filtered.length ? <ul aria-label="スキル一覧" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(skill => <li key={`${skill.category}-${skill.name}`} className="bg-white p-6 shadow-[0_3px_14px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex h-8 items-center" aria-hidden="true">
                    {skill.icon ? <img src={skill.icon} alt="" width={32} height={32} className="h-8 w-8 object-contain" /> : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" /></svg>}
                </div>
                <h2 className="text-lg font-semibold">{skill.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">{skill.category}</p>
                <p className="mt-2 text-[15px] leading-loose text-neutral-600">{skill.description}</p>
            </li>)}
        </ul> : <p className="border-y border-neutral-300 py-10 text-neutral-600">該当するスキルがありません。</p>}
    </div>;
}
