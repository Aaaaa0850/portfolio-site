import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
export interface Skill {
	name: string;
	category: string;
	description: string;
	icon?: string;
}

interface Props {
	skills: Skill[];
}

export default function SkillsExplorer({ skills }: Props) {
	const categories = [...new Set(skills.map((skill) => skill.category))];
	const [category, setCategory] = useState("すべて");
	const [query, setQuery] = useState("");
	const [slide, setSlide] = useState(0);
	const listRef = useRef<HTMLUListElement>(null);
	const reduceMotion = useReducedMotion();
	useEffect(() => {
		setSlide(0);
		listRef.current?.scrollTo({ left: 0, behavior: "instant" });
	}, [category, query]);
	function goToSlide(index: number) {
		const list = listRef.current;
		const card = list?.children[index] as HTMLElement | undefined;
		if (list && card)
			list.scrollTo({
				left: card.offsetLeft - (list.children[0] as HTMLElement).offsetLeft,
				behavior: reduceMotion ? "instant" : "smooth",
			});
	}
	const normalized = query.trim().toLocaleLowerCase();
	const filtered = skills.filter(
		(skill) =>
			(category === "すべて" || skill.category === category) &&
			`${skill.name} ${skill.category} ${skill.description}`
				.toLocaleLowerCase()
				.includes(normalized),
	);

	return (
		<div>
			<div className="flex flex-wrap gap-2" role="group" aria-label="カテゴリ">
				{["すべて", ...categories].map((item) => (
					<button
						key={item}
						type="button"
						aria-pressed={category === item}
						onClick={() => setCategory(item)}
						className="border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white"
					>
						{item}
					</button>
				))}
			</div>
			<label className="mt-6 block text-sm" htmlFor="skill-search">
				スキルを検索
			</label>
			<input
				id="skill-search"
				type="search"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				placeholder="技術名・キーワード"
				className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
			/>
			<div className="my-6 flex items-center justify-between gap-4">
				<p role="status" className="text-sm text-neutral-500">
					{filtered.length} 件
				</p>
				<button
					type="button"
					onClick={() => {
						setCategory("すべて");
						setQuery("");
					}}
					className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
				>
					リセット
				</button>
			</div>
			<ul
				ref={listRef}
				onScroll={(event) => {
					const list = event.currentTarget;
					const first = list.children[0] as HTMLElement | undefined;
					if (first)
						setSlide(
							Math.round(
								list.scrollLeft / (first.getBoundingClientRect().width + 16),
							),
						);
				}}
				aria-label="スキル一覧"
				className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3"
			>
				<AnimatePresence initial={false}>
					{filtered.map((skill) => (
						<motion.li
							layout={reduceMotion ? false : "position"}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
							key={`${skill.category}-${skill.name}`}
							className="min-w-0 shrink-0 basis-full snap-start bg-white p-6 shadow-[0_3px_14px_rgba(0,0,0,0.06)]"
						>
							<div className="mb-4 flex h-8 items-center" aria-hidden="true">
								{skill.icon ? (
									<img
										src={skill.icon}
										alt=""
										width={32}
										height={32}
										className="h-8 w-8 object-contain"
									/>
								) : (
									<svg
										width="32"
										height="32"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
									>
										<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />
									</svg>
								)}
							</div>
							<h2 className="text-lg font-semibold">{skill.name}</h2>
							<p className="mt-1 text-sm text-neutral-500">{skill.category}</p>
							<p className="mt-2 text-[15px] leading-loose text-neutral-600">
								{skill.description}
							</p>
						</motion.li>
					))}
				</AnimatePresence>
			</ul>
			{filtered.length > 0 && (
				<div
					className="mt-5 flex items-center justify-between sm:hidden"
					aria-label="スライド操作"
				>
					<button
						type="button"
						aria-label="前のスキル"
						disabled={slide <= 0}
						onClick={() => goToSlide(slide - 1)}
						className="border border-neutral-300 px-4 py-2 disabled:opacity-30 focus-visible:outline-2"
					>
						←
					</button>
					<p className="text-sm text-neutral-600" aria-live="polite">
						{Math.min(slide + 1, filtered.length)} / {filtered.length}
					</p>
					<button
						type="button"
						aria-label="次のスキル"
						disabled={slide >= filtered.length - 1}
						onClick={() => goToSlide(slide + 1)}
						className="border border-neutral-300 px-4 py-2 disabled:opacity-30 focus-visible:outline-2"
					>
						→
					</button>
				</div>
			)}
			{filtered.length === 0 && (
				<p className="border-y border-neutral-300 py-10 text-neutral-600">
					該当するスキルがありません。
				</p>
			)}
		</div>
	);
}
