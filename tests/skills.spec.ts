import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/skills');
    // React のハイドレーション完了後に操作します。
    await page.locator('astro-island[component-export="default"]:not([ssr])').waitFor();
});

test('カテゴリで絞り込み、すべてに戻せる', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Skills', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'バックエンド', exact: true }).click();
    await expect(page.getByRole('button', { name: 'バックエンド', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('list', { name: 'スキル一覧' }).getByRole('listitem')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Node.js', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'すべて', exact: true }).click();
    await expect(page.getByRole('list', { name: 'スキル一覧' }).getByRole('listitem')).toHaveCount(6);
});

test('大文字小文字と前後の空白を無視して検索できる', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'スキルを検索' }).fill('  rEaCt  ');
    await expect(page.getByRole('heading', { name: 'React', exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('1 件');
});

for (const { width, columns } of [{ width: 390, columns: 1 }, { width: 800, columns: 2 }, { width: 1280, columns: 3 }]) {
    test(`画面幅 ${width}px では ${columns} 列で表示する`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const list = page.getByRole('list', { name: 'スキル一覧' });
        await expect.poll(() => list.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(columns);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const icons = list.locator('img');
        await expect(icons).toHaveCount(5);
        await expect.poll(() => icons.evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    });
}

test('検索とカテゴリを組み合わせ、0件表示からリセットできる', async ({ page }) => {
    await page.getByRole('button', { name: 'クラウド', exact: true }).click();
    await page.getByRole('searchbox', { name: 'スキルを検索' }).fill('React');
    await expect(page.getByText('該当するスキルがありません。')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('0 件');
    await page.getByRole('button', { name: 'リセット', exact: true }).click();
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'すべて', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('status')).toHaveText('6 件');
});
