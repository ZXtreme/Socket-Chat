const fs = require('fs');
const { sensitiveWordsPath } = require('./utils')

class TrieNode {
  constructor() {
    this.children = {};        // 子节点
    this.isEndOfWord = false;  // 结束标记
  }
}

// 建立 trie 树
class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // 插入新敏感词
  insert(word) {
    let curr = this.root;

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!curr.children[ch]) {
        curr.children[ch] = new TrieNode();
      }
      curr = curr.children[ch];
    }

    curr.isEndOfWord = true;
  }

  // 过滤敏感词，转化为 ***
  filter(word) {
    const length = word.length;
    const afterFilter = []
    let i = 0;
    while (i < length) {
      let curr = this.root;
      let sensitiveEnd = -1;
      for (let j = i; j < length; j++) {
        const ch = word[j];
        if (!curr.children[ch]) {
          break
        }
        curr = curr.children[ch];
        if (curr.isEndOfWord) sensitiveEnd = j   // 最长匹配原则
      }
      if (sensitiveEnd === -1) {
        afterFilter.push(word[i])
        i++
      }
      else {
        afterFilter.push('***')
        i = sensitiveEnd + 1
      }
    }
    return afterFilter.join('');
  }
}

const sensitive_words = fs.readFileSync(sensitiveWordsPath, 'utf-8').split('\n')
const trie = new Trie()
sensitive_words.forEach(word => trie.insert(word))

module.exports = trie


