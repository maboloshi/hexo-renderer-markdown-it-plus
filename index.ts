/**
 * @Author: CHC
 * @Maintainer: D-Sketon
 * @Date:   2017-07-24T14:14:59+08:00
 * @Email:  chenhuachaoxyz@gmail.com
 * @Filename: index.js
 * @Last modified by:   D-Sketon
 * @Last modified time: 2024-12-14T16:35:35+08:00
 * @License: MIT
 * @Copyright: 2017
 */
import renderer from './lib/renderer';


hexo.extend.renderer.register('md', 'html', renderer, true);
hexo.extend.renderer.register('markdown', 'html', renderer, true);
hexo.extend.renderer.register('mkd', 'html', renderer, true);
hexo.extend.renderer.register('mkdn', 'html', renderer, true);
hexo.extend.renderer.register('mdwn', 'html', renderer, true);
hexo.extend.renderer.register('mdtxt', 'html', renderer, true);
hexo.extend.renderer.register('mdtext', 'html', renderer, true);

