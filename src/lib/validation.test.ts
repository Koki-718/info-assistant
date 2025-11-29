
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidTopic } from './validation';

describe('Validation Logic', () => {
    it('should return false for empty string', () => {
        assert.strictEqual(isValidTopic(''), false);
    });

    it('should return false for whitespace only', () => {
        assert.strictEqual(isValidTopic('   '), false);
    });

    it('should return true for valid topic', () => {
        assert.strictEqual(isValidTopic('AI'), true);
    });

    it('should return false for topic exceeding max length', () => {
        const longTopic = 'a'.repeat(51);
        assert.strictEqual(isValidTopic(longTopic), false);
    });
});
