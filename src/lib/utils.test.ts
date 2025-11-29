
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { cn } from './utils';

describe('Utils', () => {
    it('should merge class names', () => {
        const result = cn('p-4', 'bg-red-500');
        assert.strictEqual(result, 'p-4 bg-red-500');
    });

    it('should handle conditional classes', () => {
        const result = cn('p-4', false && 'bg-red-500', 'text-white');
        assert.strictEqual(result, 'p-4 text-white');
    });

    it('should merge tailwind classes correctly', () => {
        // tailwind-merge should resolve conflicts (p-4 vs p-2 -> p-2)
        const result = cn('p-4', 'p-2');
        assert.strictEqual(result, 'p-2');
    });
});
