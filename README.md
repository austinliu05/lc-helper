# LeetCode Topic Analyzer (Beta)

A Chrome extension that intelligently analyzes LeetCode problems and highlights keywords that reveal the underlying algorithm or data structure being tested. This tool helps you quickly identify problem-solving patterns and improve your algorithmic thinking.

Currently building a ML model to analyze problem descriptions and highlight keywords that help identify the topic of the problem instead of having a hardcoded dictionary (current implementation).

[Dataset](https://huggingface.co/datasets/kaysss/leetcode-problem-set?utm_source=chatgpt.com) and [Kaggle](https://www.kaggle.com/code/apoxieforest/lc-topic-identifier/edit)

## Features

### Smart Keyword Detection
- Automatically identifies and highlights topic-related keywords in problem descriptions
- Color-coded highlighting for 12 major algorithm/data structure topics
- Real-time analysis as you navigate between problems

### Topic Classification
The extension recognizes and highlights keywords for these topics:

- **Arrays & Strings** - array, string, substring, subarray, concatenate, split, join
- **Linked Lists** - linked list, node, next, head, tail, pointer, traverse
- **Trees & Graphs** - tree, graph, node, edge, vertex, root, leaf, traversal
- **Dynamic Programming** - dp, dynamic programming, memoization, recursion, optimal
- **Two Pointers** - two pointers, slow, fast, pointer, collision, meeting
- **Sliding Window** - sliding window, window, k elements, consecutive
- **Binary Search** - binary search, sorted, middle, left, right, target
- **Stack & Queue** - stack, queue, push, pop, peek, dequeue, enqueue
- **Hash Table** - hash, hashmap, hashset, dictionary, key, value, lookup
- **Greedy** - greedy, optimal, local optimum, choice, select
- **Backtracking** - backtrack, combination, permutation, subset, recursion
- **Bit Manipulation** - bit, xor, and, or, shift, mask, binary

### Customizable Experience
- Toggle analysis on/off with a single click
- Enable/disable specific topics individually
- Adjust highlight opacity for better readability
- Auto-analyze on page load option
- Persistent settings across browser sessions

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd lc-helper
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "LeetCode Topic Analyzer" and click the pin icon

### Method 2: Chrome Web Store (Coming Soon)
- The extension will be available on the Chrome Web Store for easy installation

## Usage

### Basic Usage
1. **Navigate to LeetCode**
   - Go to any LeetCode problem page (e.g., https://leetcode.com/problems/two-sum/)
   - The extension will automatically analyze the problem description

2. **View Highlights**
   - Keywords will be highlighted with color-coded backgrounds
   - Hover over highlights to see topic information
   - Click the extension icon to open the control panel

### Advanced Features

#### Popup Controls
- **Enable/Disable Analysis**: Toggle keyword highlighting on/off
- **Topic Legend**: View all supported topics with their colors
- **Topic Toggle**: Click on topics to enable/disable specific categories
- **Settings**: Adjust opacity and auto-analyze preferences
- **Statistics**: See how many topics and keywords were found

#### Keyboard Shortcuts
- `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac): Toggle analysis
- `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac): Refresh analysis
- `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac): Clear highlights

#### Context Menu
- Right-click on any LeetCode page to access quick actions
- "Analyze LeetCode Problem" - Refresh the analysis
- "Clear Highlights" - Remove all highlights


## Troubleshooting

### Extension Not Working
1. **Check if you're on LeetCode**: The extension only works on leetcode.com
2. **Refresh the page**: Try refreshing the LeetCode problem page
3. **Check console**: Open Developer Tools (F12) and check for errors
4. **Reinstall extension**: Remove and reload the extension

### Highlights Not Appearing
1. **Enable analysis**: Make sure the toggle is enabled in the popup
2. **Check topic settings**: Ensure the relevant topics are enabled
3. **Page structure**: Some LeetCode pages might use different selectors

### Performance Issues
1. **Disable unused topics**: Turn off topics you don't need
2. **Reduce opacity**: Lower the highlight opacity setting
3. **Clear highlights**: Use the clear button to remove existing highlights

## Contributing

Contributions are welcome! Here are some ways you can help:

1. **Add new topics**: Identify missing algorithm/data structure categories
2. **Improve keywords**: Suggest better keyword lists for existing topics
3. **Enhance UI**: Improve the popup interface or styling
4. **Bug fixes**: Report and fix issues
5. **Documentation**: Improve this README or add code comments

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on LeetCode
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have suggestions:

1. **Check the troubleshooting section** above
2. **Open an issue** on GitHub
3. **Contact the maintainers** through GitHub

## Changelog

### Version 1.0.0
- Initial release
- 12 topic categories with keyword detection
- Popup interface with controls
- Settings persistence
- Welcome page
- Keyboard shortcuts and context menu

---

**Happy coding! 🚀**

This extension is designed to help you become more efficient at identifying problem patterns on LeetCode. Remember, the goal is to improve your algorithmic thinking, not just to get the answers quickly!
