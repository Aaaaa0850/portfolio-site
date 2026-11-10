import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/skills');
    await page
        .locator('astro-island[component-export="default"]:not([ssr])')
        .waitFor();
});

test('カテゴリと検索を組み合わせて絞り込み、リセットできる', async ({
    page,
}) => {
    const list = page.getByRole('list', { name: 'スキル一覧' });
    const total = await list.getByRole('listitem').count();
    await page
        .getByRole('group', { name: 'カテゴリ' })
        .getByRole('button')
        .nth(1)
        .click();
    await expect
        .poll(() => list.getByRole('listitem').count())
        .toBeLessThan(total);
    await page.getByRole('searchbox').fill('___no_matching_skill___');
    await expect(list.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByText('該当するスキルがありません。')).toBeVisible();
    await page.getByRole('button', { name: 'リセット' }).click();
    await expect(list.getByRole('listitem')).toHaveCount(total);
    await expect(page.getByRole('searchbox')).toHaveValue('');
});

test('大文字小文字と空白を無視して検索する', async ({ page }) => {
    await page.getByRole('searchbox').fill('  rEaCt  ');
    await expect(
        page.getByRole('heading', { name: 'React', exact: true }),
    ).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Git', exact: true }),
    ).toHaveCount(0);
});

test('モバイルでスライドし、検索後は先頭に戻る', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    const list = page.getByRole('list', { name: 'スキル一覧' });
    const total = await list.getByRole('listitem').count();
    await expect(
        page.getByRole('button', { name: '前のスキル' }),
    ).toBeDisabled();
    await page.getByRole('button', { name: '次のスキル' }).click();
    await expect(page.getByText(`2 / ${total}`, { exact: true })).toBeVisible();
    await expect
        .poll(() => list.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
    await page.getByRole('searchbox').fill('React');
    await expect(
        page.getByRole('button', { name: '前のスキル' }),
    ).toBeDisabled();
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBe(0);
    await expect
        .poll(() =>
            page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        )
        .toBe(true);
});

test('デスクトップで3列に並ぶ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect
        .poll(() =>
            page
                .getByRole('list', { name: 'スキル一覧' })
                .evaluate(
                    (el) =>
                        getComputedStyle(el).gridTemplateColumns.split(' ')
                            .length,
                ),
        )
        .toBe(3);
});
