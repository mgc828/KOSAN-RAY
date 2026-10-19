import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizePagePath,
  savePageCustomization,
  getCustomizationsForPage,
  resetPageCustomization,
  UICustomizationItem,
} from '../lib/ui-customizer-store';

describe('UI Customizer Store', () => {
  const testPath = '/test-page-customizer';

  beforeEach(async () => {
    await resetPageCustomization(testPath);
  });

  it('normalizes page paths into valid document IDs', () => {
    expect(normalizePagePath('/')).toBe('root');
    expect(normalizePagePath('/cari-kost')).toBe('cari-kost');
    expect(normalizePagePath('/kost/kost-kuningan-1')).toBe('kost_kost-kuningan-1');
  });

  it('saves and retrieves element customizations for a specific page', async () => {
    const items: UICustomizationItem[] = [
      {
        id: 'btn_search',
        selector: '#btn-search-maps',
        label: 'Tombol Maps',
        styles: {
          textAlign: 'right',
          marginTop: 15,
          order: 2,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: '#F59E0B',
        },
        customText: 'Cari Lewat Peta',
        updatedAt: new Date().toISOString(),
      },
    ];

    await savePageCustomization(testPath, items);

    const loaded = await getCustomizationsForPage(testPath);
    expect(loaded.length).toBe(1);
    expect(loaded[0].selector).toBe('#btn-search-maps');
    expect(loaded[0].styles.textAlign).toBe('right');
    expect(loaded[0].styles.marginTop).toBe(15);
    expect(loaded[0].customText).toBe('Cari Lewat Peta');
  });

  it('resets page customization', async () => {
    await savePageCustomization(testPath, [
      {
        id: 'test_item',
        selector: 'h1',
        styles: { textAlign: 'center' },
        updatedAt: new Date().toISOString(),
      },
    ]);

    await resetPageCustomization(testPath);
    const loaded = await getCustomizationsForPage(testPath);
    expect(loaded.length).toBe(0);
  });
});

