<?xml version="1.0" encoding="UTF-8" ?>  <!DOCTYPE html>  <html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateUrl='indie.xml' b:templateVersion='1.3.3' expr:dir='data:blog.languageDirection' expr:lang='data:blog.locale' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>  <head>  
  <meta content='width=device-width, initial-scale=1' name='viewport'/>  
  <title><b:if cond='data:view.title'><data:view.title.escaped/><b:else/>Easy Digital Journey</b:if></title>  
  <meta content='index, follow' name='robots'/>  
  <b:if cond='data:view.isSingleItem'>  
    <b:if cond='data:post.snippet'>  
      <meta expr:content='data:post.snippet' name='description'/>  
    <b:else/>  
      <meta content='Learn Digital Skills. Build Online. Grow Step by Step.' name='description'/>  
    </b:if>  
  <b:else/>  
    <meta content='Learn Digital Skills. Build Online. Grow Step by Step.' name='description'/>  
  </b:if>  
  <meta content='Blogging, SEO, Digital Skills, Online Earning, Tutorials' name='keywords'/>  
  <link href='https://www.easydigitaljourney.online/sitemap.xml' rel='sitemap' type='application/xml'/>    <!-- Preconnect Optimized -->    <link href='https://fonts.gstatic.com' rel='preconnect' crossorigin='anonymous'/>  
  <link href='https://fonts.googleapis.com' rel='dns-prefetch'/>    <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&amp;family=Open+Sans:wght@400;500;600&amp;display=swap' rel='stylesheet'/>  
  <meta expr:content='data:view.title.escaped' property='og:title'/>  
  <meta content='Easy Digital Journey' property='og:site_name'/>  
  <meta content='summary_large_image' name='twitter:card'/>  
  <b:include data='blog' name='all-head-content'/>    <script async='async' src='https://www.googletagmanager.com/gtag/js?id=G-BFP86GBTWG'/>  
  <script>  
    window.dataLayer = window.dataLayer || [];  
    function gtag(){dataLayer.push(arguments);}  
    gtag(&#39;js&#39;, new Date());  
    gtag(&#39;config&#39;, &#39;G-BFP86GBTWG&#39;);  
  </script>  <b:skin version='1.3.3'><![CDATA[

:root{
--primary:#0284c7;
--primary-light:#e0f2fe;
--primary-dark:#0369a1;
--bg:#f8fbff;
--card:#ffffff;
--text:#334155;
--text-light:#64748b;
--border:#e2e8f0;
--shadow:0 4px 15px rgba(0,0,0,0.05);
}

- { box-sizing: border-box; margin: 0; padding: 0; }

body {
background: var(--bg);
color: var(--text);
font-family: 'Open Sans', sans-serif;
font-size: 16px;
line-height: 1.7;
}

h1, h2, h3, h4, h5, h6 {
font-family: 'Poppins', sans-serif;
color: var(--primary-dark);
margin-bottom: 15px;
}

a { color: var(--primary); text-decoration: none; transition: 0.2s; }
a:hover { color: var(--primary-dark); }
img { max-width: 100%; height: auto; border-radius: 10px; }

.page { max-width: 1100px; margin: 0 auto; background: var(--card); min-height: 100vh; box-shadow: var(--shadow); }
.content-wrapper { display: flex; gap: 25px; padding: 25px; max-width: 1100px; margin: 0 auto; }
.main-content { flex: 1; min-width: 0; }
.sidebar-container { width: 320px; flex-shrink: 0; }

header { background: var(--card); border-bottom: 1px solid var(--border); padding: 20px 25px; }
.header-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
.logo a { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 700; color: var(--primary); }
.logo span { color: var(--primary-dark); }
.tagline { color: var(--text-light); font-size: 14px; margin-top: 5px; }

.content-wrapper { display: block; padding: 25px; max-width: 1100px; margin: 0 auto; }
.main-content { width: 100%; max-width: 100%; }
.sidebar-container { width: 100%; max-width: 100%; margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 25px; }

.hero-section { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 50px 25px; text-align: center; }
.hero-section h1 { color: #fff; font-size: 32px; margin-bottom: 15px; }
.hero-section p { font-size: 18px; max-width: 700px; margin: 0 auto 25px; opacity: 0.9; }
.hero-btn { display: inline-block; background: #fff; color: var(--primary); padding: 12px 30px; border-radius: 30px; font-weight: 600; font-family: 'Poppins', sans-serif; }
.hero-btn:hover { background: var(--primary-light); transform: translateY(-2px); }

.post { background: var(--card); border: 1px solid var(--border); border-radius: 15px; overflow: hidden; margin-bottom: 30px; box-shadow: var(--shadow); }
.post-title { font-size: 24px; padding: 25px 25px 10px; margin: 0; }
.post-title a { color: var(--primary-dark); }
.post-meta { padding: 0 25px 15px; color: var(--text-light); font-size: 13px; font-family: 'Poppins', sans-serif; }
.post-body { padding: 0 25px 25px; font-size: 16px; color: var(--text); line-height: 1.8; }
.post-body p { margin-bottom: 15px; }
.post-body h2, .post-body h3 { margin-top: 25px; color: var(--primary); }
.post-body img { margin: 15px 0; border-radius: 10px; }
.jump-link { padding: 0 25px 25px; }
.jump-link a { display: inline-block; background: var(--primary); color: #fff; padding: 10px 25px; border-radius: 25px; font-weight: 600; font-family: 'Poppins', sans-serif; }
.jump-link a:hover { background: var(--primary-dark); }

.widget { background: var(--card); border: 1px solid var(--border); border-radius: 15px; padding: 20px; margin-bottom: 25px; box-shadow: var(--shadow); }
.widget .title { font-size: 18px; border-bottom: 2px solid var(--primary-light); padding-bottom: 10px; margin-bottom: 15px; }
.widget ul { list-style: none; }
.widget ul li { padding: 8px 0; border-bottom: 1px solid var(--border); }
.widget ul li:last-child { border-bottom: none; }
.widget ul li a { color: var(--text); font-weight: 500; }
.widget ul li a:hover { color: var(--primary); }

footer { background: var(--primary-dark); color: #fff; padding: 30px 25px; text-align: center; margin-top: 30px; }
footer a { color: var(--primary-light); }
footer a:hover { color: #fff; text-decoration: underline; }

.blog-pager { display: flex; justify-content: space-between; margin-top: 25px; }
.blog-pager a { background: var(--primary-light); color: var(--primary-dark); padding: 10px 20px; border-radius: 10px; font-weight: 600; }

/* Post Share Buttons CSS */
.post-share-buttons {
margin: 25px 0;
padding: 15px 0;
border-top: 1px solid var(--border);
border-bottom: 1px solid var(--border);
display: flex;
align-items: center;
flex-wrap: wrap;
gap: 10px;
}
.share-label {
font-weight: 600;
color: var(--primary-dark);
font-family: 'Poppins', sans-serif;
margin-right: 5px;
}
.share-btn {
padding: 8px 15px;
border-radius: 20px;
color: #fff !important;
font-size: 14px;
font-weight: 600;
text-decoration: none;
transition: 0.3s;
}
.share-btn:hover {
opacity: 0.85;
transform: translateY(-2px);
}
.share-btn.whatsapp { background-color: #25D366; }
.share-btn.facebook { background-color: #1877F2; }
.share-btn.twitter { background-color: #1DA1F2; }
.share-btn.copy-link { background-color: var(--primary); }

@media (max-width: 850px) {
.content-wrapper {
display: block;
padding: 25px;
max-width: 1100px;
margin: 0 auto;
}
.main-content {
width: 100%;
max-width: 100%;
}
.sidebar-container {
width: 100%;
max-width: 100%;
margin-top: 40px;
border-top: 2px solid #e2e8f0;
padding-top: 25px;
}
.hero-section h1 { font-size: 24px; }
.hero-section p { font-size: 16px; }
.post-title { font-size: 20px; padding: 20px 20px 10px; }
.post-meta, .post-body, .jump-link { padding-left: 20px; padding-right: 20px; }
.logo a { font-size: 22px; }
}
]]></b:skin>

<b:template-skin><![CDATA[ body#layout .hidden, body#layout .invisible { display: inherit; } body#layout .navigation { display: none; } body#layout .page, body#layout .sidebar_top, body#layout .sidebar_bottom { display: inline-block; position: relative; vertical-align: top; } body#layout .page { float: right; margin-left: 20px; width: 55%; } body#layout .sidebar-container { float: left; width: 40%; } ]]></b:template-skin>
<b:include data='blog' name='google-analytics'/>

</head>  <body>  
  <b:class cond='data:view.isPreview' name='preview'/>  
  <b:class cond='data:view.isSingleItem' name='item-view'/>  
  <b:include name='skipNavigation'/>    <div class='page'>  
    <header role='banner'>  
      <div class='header-inner'>  
        <div class='logo'>  
          <a aria-label='Easy Digital Journey' expr:href='data:blog.homepageUrl'>  
  Easy <span>Digital Journey</span>  
</a>  
          <div class='tagline'>Learn Digital Skills. Build Online. Grow Step by Step.</div>  
        </div>  
        <nav role='navigation'>  
          <b:section class='clearboth' id='page_list_top' name='Page List (Top)' showaddelement='false'>  
            <b:widget id='PageList1' locked='true' title='' type='PageList' version='2' visible='true'>  
              <b:widget-settings>  
                <b:widget-setting name='pageListJson'><![CDATA[{"8164148507000096237":{"href":"https://www.easydigitaljourney.online/p/free-facebook-growth-planner.html","position":0,"title":"Free Facebook Growth Planner"},"6898071574178320959":{"href":"https://www.easydigitaljourney.online/p/online-earning-planner.html","position":2,"title":"Online Earning Planner"},"2554671280796151711":{"href":"https://www.easydigitaljourney.online/p/universal-question-paper-maker.html","position":3,"title":"Universal Question Paper Maker "},"3639953155003702032":{"href":"https://www.easydigitaljourney.online/p/auto-generated-school-planner.html","position":1,"title":"Auto Generated School planner"}}]]></b:widget-setting>  
                <b:widget-setting name='homeTitle'>Home</b:widget-setting>  
              </b:widget-settings>  
              <b:includable id='main'>  
                <div class='widget-content'>  
                  <ul>  
                    <b:loop values='data:links' var='link'>  
                      <li expr:class='data:link.isCurrentPage ? &quot;selected&quot; : &quot;&quot;'><a expr:href='data:link.href'><data:link.title/></a></li>  
                    </b:loop>  
                  </ul>  
                </div>  
              </b:includable>  
              <b:includable id='content'>  
  <div class='widget-content'>  
    <b:include name='pageList'/>  
  </div>  
</b:includable>  
              <b:includable id='overflowButton'>  
  <b:include name='verticalMoreIcon'/>  
</b:includable>  
              <b:includable id='overflowablePageList'>  
  <div class='overflowable-container'>  
    <div class='overflowable-contents'>  
      <div class='container'>  
        <b:with value='true' var='overflow'>  
        <b:with value='&quot;tabs&quot;' var='pageListClass'>  
          <b:include name='pageList'/>  
        </b:with>  
        </b:with>  
      </div>  
    </div>  
    <div class='overflow-button hidden'>  
      <b:include name='overflowButton'/>  
    </div>  
  </div>  
</b:includable>  
              <b:includable id='pageLink'>  
  <li>  
    <b:class cond='data:overflow' name='overflowable-item'/>  
    <b:class cond='data:link.isCurrentPage' name='selected'/>  <a expr:href='data:link.href'><data:link.title/></a>

  </li>  
</b:includable>  
              <b:includable id='pageList'>  
  <ul>  
    <b:class cond='data:pageListClass' expr:name='data:pageListClass'/>  
    <b:loop values='data:links' var='link'>  
      <b:include name='pageLink'/>  
    </b:loop>  
  </ul>  
</b:includable>  
            </b:widget>  
          </b:section>  
        </nav>  
      </div>  
    </header>  <b:if cond='data:view.isHomepage'>  
  <div class='hero-section'>  
    <h1>Welcome to Easy Digital Journey!</h1>  
    <p>Your step-by-step guide to blogging, SEO, and online earning. Learning has no age limit &#8212; let&#39;s grow together!</p>  
    <a class='hero-btn' href='#main'>Explore Tutorials &#8594;</a>  
  </div>  
</b:if>  

<div class='content-wrapper'>  
    
  <main class='main-content' id='main' role='main' tabindex='-1'>  
    <b:section class='main' id='page_body' name='Page Body' showaddelement='true'>  
      <b:widget id='Blog1' locked='false' title='Blog Posts' type='Blog' version='2' visible='true'>  
        <b:widget-settings>  
          <b:widget-setting name='showDateHeader'>false</b:widget-setting>  
          <b:widget-setting name='showShareButtons'>true</b:widget-setting>  
          <b:widget-setting name='showCommentLink'>true</b:widget-setting>  
          <b:widget-setting name='showAuthor'>true</b:widget-setting>  
          <b:widget-setting name='style.unittype'>TextAndImage</b:widget-setting>  
          <b:widget-setting name='timestampLabel'/>  
          <b:widget-setting name='reactionsLabel'/>  
          <b:widget-setting name='showAuthorProfile'>false</b:widget-setting>  
          <b:widget-setting name='style.layout'>1x1</b:widget-setting>  
          <b:widget-setting name='showLabels'>true</b:widget-setting>  
          <b:widget-setting name='showLocation'>true</b:widget-setting>  
          <b:widget-setting name='postLabelsLabel'/>  
          <b:widget-setting name='showTimestamp'>true</b:widget-setting>  
          <b:widget-setting name='postsPerAd'>1</b:widget-setting>  
          <b:widget-setting name='showBacklinks'>false</b:widget-setting>  
          <b:widget-setting name='showInlineAds'>false</b:widget-setting>  
          <b:widget-setting name='showReactions'>false</b:widget-setting>  
        </b:widget-settings>  
        <b:includable id='main'>  
          <b:include name='super.main'/>  
        </b:includable>  
        <b:includable id='aboutPostAuthor'>

  <div class='author-name'>  
    <a class='g-profile' expr:href='data:post.author.profileUrl' rel='author' title='author profile'>  
      <span>  
        <data:post.author.name/>  
      </span>  
    </a>  
  </div>  
  <div>  
    <span class='author-desc'>  
      <data:post.author.aboutMe/>  
    </span>  
  </div>  
</b:includable>  
            <b:includable id='addComments'>  
  <a expr:href='data:post.commentsUrl' expr:onclick='data:post.commentsUrlOnclick'>  
    <b:message name='messages.postAComment'/>  
  </a>  
</b:includable>  
            <b:includable id='commentAuthorAvatar'>  
  <div class='avatar-image-container'>  
    <img class='author-avatar' expr:src='data:comment.authorAvatarSrc' height='35' width='35'/>  
  </div>  
</b:includable>  
            <b:includable id='commentDeleteIcon' var='comment'>  
  <span expr:class='&quot;item-control &quot; + data:comment.adminClass'>  
    <b:if cond='data:showCmtPopup'>  
      <div class='goog-toggle-button'>  
        <div class='goog-inline-block comment-action-icon'/>  
      </div>  
    <b:else/>  
      <a class='comment-delete' expr:href='data:comment.deleteUrl' expr:title='data:messages.deleteComment'>  
        <img src='https://resources.blogblog.com/img/icon_delete13.gif'/>  
      </a>  
    </b:if>  
  </span>  
</b:includable>  
            <b:includable id='commentForm' var='post'>  
  <div class='comment-form'>  
    <a name='comment-form'/>  
    <h4 id='comment-post-message'><data:messages.postAComment/></h4>  
    <b:if cond='data:this.messages.blogComment != &quot;&quot;'>  
      <p><data:this.messages.blogComment/></p>  
    </b:if>  
    <b:include data='post' name='commentFormIframeSrc'/>  
    <iframe allowtransparency='allowtransparency' class='blogger-iframe-colorize blogger-comment-from-post' expr:height='data:cmtIframeInitialHeight ?: &quot;90px&quot;' frameborder='0' id='comment-editor' name='comment-editor' src='' width='100%'/>  
    <data:post.cmtfpIframe/>  
    <script type='text/javascript'>  
      BLOG_CMT_createIframe(&#39;<data:post.appRpcRelayPath/>&#39;);  
    </script>  
  </div>  
</b:includable>  
            <b:includable id='commentFormIframeSrc' var='post'>  
  <a expr:href='data:post.commentFormIframeSrc' id='comment-editor-src'/>  
</b:includable>  
            <b:includable id='commentItem' var='comment'>  
  <div class='comment' expr:id='&quot;c&quot; + data:comment.id'>  
    <b:include cond='data:blog.enabledCommentProfileImages' name='commentAuthorAvatar'/>  <div class='comment-block'>  
  <div class='comment-author'>  
    <b:if cond='data:comment.authorUrl'>  
      <b:message name='messages.authorSaidWithLink'>  
        <b:param expr:value='data:comment.author' name='authorName'/>  
        <b:param expr:value='data:comment.authorUrl' name='authorUrl'/>  
      </b:message>  
    <b:else/>  
      <b:message name='messages.authorSaid'>  
        <b:param expr:value='data:comment.author' name='authorName'/>  
      </b:message>  
    </b:if>  
  </div>  
  <div expr:class='&quot;comment-body&quot; + (data:comment.isDeleted ? &quot; deleted&quot; : &quot;&quot;)'>  
    <data:comment.body/>  
  </div>  
  <div class='comment-footer'>  
    <span class='comment-timestamp'>  
      <a expr:href='data:comment.url' title='comment permalink'>  
        <data:comment.timestamp/>  
      </a>  
      <b:include data='comment' name='commentDeleteIcon'/>  
    </span>  
  </div>  
</div>

  </div>  
</b:includable>  
            <b:includable id='commentList' var='comments'>  
  <div id='comments-block'>  
    <b:loop values='data:comments' var='comment'>  
      <b:include data='comment' name='commentItem'/>  
    </b:loop>  
  </div>  
</b:includable>  
            <b:includable id='commentPicker' var='post'>  
  <b:if cond='data:post.showThreadedComments'>  
    <b:include data='post' name='threadedComments'/>  
  <b:else/>  
    <b:include data='post' name='comments'/>  
  </b:if>  
</b:includable>  
            <b:includable id='comments' var='post'>  
  <section expr:class='&quot;comments&quot; + (data:post.embedCommentForm ? &quot; embed&quot; : &quot;&quot;)' expr:data-num-comments='data:post.numberOfComments' id='comments'>  
    <a name='comments'/>  
    <b:if cond='data:post.allowComments'>  <b:include name='commentsTitle'/>  

  <div expr:id='data:widget.instanceId + &quot;_comments-block-wrapper&quot;'>  
    <b:include cond='data:post.comments' data='post.comments' name='commentList'/>  
  </div>  

  <b:if cond='data:post.commentPagingRequired'>  
    <div class='paging-control-container'>  
      <b:if cond='data:post.hasOlderLinks'>  
        <a expr:class='data:post.oldLinkClass' expr:href='data:post.oldestLinkUrl'>  
          <data:messages.oldest/>  
        </a>  
        <a expr:class='data:post.oldLinkClass' expr:href='data:post.olderLinkUrl'>  
          <data:messages.older/>  
        </a>  
      </b:if>  

      <span class='comment-range-text'>  
        <data:post.commentRangeText/>  
      </span>  

      <b:if cond='data:post.hasNewerLinks'>  
        <a expr:class='data:post.newLinkClass' expr:href='data:post.newerLinkUrl'>  
          <data:messages.newer/>  
        </a>  
        <a expr:class='data:post.newLinkClass' expr:href='data:post.newestLinkUrl'>  
          <data:messages.newest/>  
        </a>  
      </b:if>  
    </div>  
  </b:if>  

  <div class='footer'>  
    <b:if cond='data:post.embedCommentForm'>  
      <b:if cond='data:post.allowNewComments'>  
        <b:include data='post' name='commentForm'/>  
      <b:else/>  
        <data:post.noNewCommentsText/>  
      </b:if>  
    <b:else/>  
      <b:if cond='data:post.allowComments'>  
        <b:include data='post' name='addComments'/>  
      </b:if>  
    </b:if>  
  </div>  
</b:if>  
<b:if cond='data:showCmtPopup'>  
  <div id='comment-popup'>  
    <iframe allowtransparency='allowtransparency' frameborder='0' id='comment-actions' name='comment-actions' scrolling='no'>  
    </iframe>  
  </div>  
</b:if>

  </section>  
</b:includable>  
            <b:includable id='commentsTitle'>  
  <h3 class='title'><data:messages.comments/></h3>  
</b:includable>  
            <b:includable id='feedLinks'>  
  <b:if cond='!data:view.isPost'> <!-- Blog feed links -->  
    <b:if cond='data:feedLinks'>  
      <div class='blog-feeds'>  
        <b:include data='feedLinks' name='feedLinksBody'/>  
      </div>  
    </b:if>  
  <b:else/> <!--Post feed links -->  
    <div class='post-feeds'>  
      <b:loop values='data:posts' var='post'>  
        <b:if cond='data:post.allowComments and data:post.feedLinks'>  
          <b:include data='post.feedLinks' name='feedLinksBody'/>  
        </b:if>  
      </b:loop>  
    </div>  
  </b:if>  
</b:includable>  
            <b:includable id='feedLinksBody' var='links'>  
  <div class='feed-links'>  
  <data:messages.subscribeTo/>  
  <b:loop values='data:links' var='f'>  
     <a class='feed-link' expr:href='data:f.url' expr:type='data:f.mimeType' target='_blank'><data:f.name/> (<data:f.feedType/>)</a>  
  </b:loop>  
  </div>  
</b:includable>  
            <b:includable id='headerByline'>  
              <div class='post-meta'>  
                <data:post.date/>  
                <b:if cond='data:post.labels'>  
                  &#160;&#183;&#160;  
                  <b:loop values='data:post.labels' var='label'>  
                    <a expr:href='data:label.url'><data:label.name/></a><b:if cond='not data:label.isLast'>, </b:if>  
                  </b:loop>  
                </b:if>  
              </div>  
            </b:includable>  
            <b:includable id='homePageLink'>  
  <a class='home-link' expr:href='data:blog.homepageUrl'>  
    <data:messages.home/>  
  </a>  
</b:includable>  
            <b:includable id='iframeComments' var='post'>  
  <!-- G+ comments, no longer available. The includable is retained for backwards-compatibility. -->  
</b:includable>  
            <b:includable id='inlineAd' var='post'>  
  <b:if cond='!data:view.isPreview'>  
    <b:if cond='data:this.adCode or data:this.adClientId or data:blog.adsenseClientId'>  
      <!-- Ad -->  
      <div class='inline-ad'>  
        <b:if cond='data:this.adCode != &quot;&quot;'>  
          <data:this.adCode/>  
        <b:else/>  
          <b:include cond='data:this.adClientId or data:blog.adsenseClientId' name='defaultAdUnit'/>  
        </b:if>  
      </div>  
    </b:if>  
  <b:else/>  
    <div class='inline-ad'>  
      <div class='inline-ad-placeholder'>  
        <span><b:message name='messages.adsGoHere'/></span>  
      </div>  
    </div>  
  </b:if>  
</b:includable>  
            <b:includable id='nextPageLink'>  
              <div class='blog-pager'><a expr:href='data:olderPageUrl'>Older Posts &#8594;</a></div>  
            </b:includable>  
            <b:includable id='post' var='post'>  
              <article class='post' role='article'>  
                <b:include data='post' name='postTitle'/>  
                <b:include data='post' name='headerByline'/>  
                <b:if cond='data:view.isSingleItem'>  
                  <b:include data='post' name='postBody'/>  <!-- Post Share Buttons Start -->  
              <div class='post-share-buttons'>  
                <span class='share-label'>Share this post:</span>  
                <a class='share-btn whatsapp' expr:href='"https://api.whatsapp.com/send?text=" + data:post.title + " - " + data:post.url' rel='noopener' target='_blank'>WhatsApp</a>  
                <a class='share-btn facebook' expr:href='"https://www.facebook.com/sharer/sharer.php?u=" + data:post.url' rel='noopener' target='_blank'>Facebook</a>  
                <a class='share-btn twitter' expr:href='"https://twitter.com/intent/tweet?url=" + data:post.url + "&amp;text=" + data:post.title' rel='noopener' target='_blank'>Twitter</a>  
                <a class='share-btn copy-link' href='#' onclick='copyPostLink(event)'>Copy Link</a>  
              </div>  
              <!-- Post Share Buttons End -->  
                
            <b:else/>  
              <b:include data='post' name='postBodySnippet'/>  
              <b:include data='post' name='postFooterJumpLink'/>  
            </b:if>  
          </article>  
        </b:includable>  
        <b:includable id='postBody' var='post'>  
          <div class='post-body entry-content'><data:post.body/></div>  
        </b:includable>  
        <b:includable id='postBodySnippet' var='post'>  
          <div class='post-body'>  
            <b:if cond='data:post.featuredImage'>  
              <div class='snippet-thumbnail'><a expr:href='data:post.url'><img expr:alt='data:post.title' expr:src='data:post.featuredImage.url'/></a></div>  
            </b:if>  
            <data:post.snippet/>  
          </div>  
        </b:includable>  
        <b:includable id='postCommentsAndAd' var='post'>

  <article class='post-outer-container'>  
    <!-- Post title and body -->  
    <div class='post-outer'>  
      <b:include data='post' name='post'/>  
    </div>  <!-- Comments -->  
<b:include cond='data:view.isSingleItem' data='post' name='commentPicker'/>  

<!-- Show ad inside post container, after comments, if single item. -->  
<b:include cond='data:view.isSingleItem and data:post.includeAd' data='post' name='inlineAd'/>

  </article>    <!-- Show ad outside post container (between posts) for feed pages. -->  <b:include cond='data:view.isMultipleItems and data:post.includeAd' data='post' name='inlineAd'/>
</b:includable>
<b:includable id='postCommentsLink'>
<b:if cond='data:view.isMultipleItems'>
<span class='byline post-comment-link container'>
<b:include cond='data:post.commentSource != 1' name='commentsLink'/>
</span>
</b:if>
</b:includable>
<b:includable id='postFooter' var='post'>

  <div class='post-footer'>  
    <b:include name='footerBylines'/>  
    <b:include data='post' name='postFooterAuthorProfile'/>  
  </div>  
</b:includable>  
            <b:includable id='postFooterAuthorProfile' var='post'>  
  <b:if cond='data:post.author.aboutMe and data:view.isPost'>  
    <div class='author-profile'>  
      <b:if cond='data:post.author.authorPhoto.url'>  
        <img class='author-image' expr:src='data:post.author.authorPhoto.url' width='50px'/>  
        <div class='author-about'>  
          <b:include data='post' name='aboutPostAuthor'/>  
        </div>  
      <b:else/>  
        <b:include data='post' name='aboutPostAuthor'/>  
      </b:if>  
    </div>  
  </b:if>  
</b:includable>  
            <b:includable id='postFooterJumpLink'>  
              <div class='jump-link'><a expr:href='data:post.url'>Read More &#8594;</a></div>  
            </b:includable>  
            <b:includable id='postHeader' var='post'>  
  <b:include name='headerByline'/>  
</b:includable>  
            <b:includable id='postMeta' var='post'>  
  <b:include data='post' name='postMetadataJSON'/>  
</b:includable>  
            <b:includable id='postPagination'>  
  <div class='blog-pager container' id='blog-pager'>  
    <b:include cond='data:newerPageUrl' name='previousPageLink'/>  
    <b:include cond='data:olderPageUrl' name='nextPageLink'/>  
    <b:include cond='data:view.url != data:blog.homepageUrl' name='homePageLink'/>  
  </div>  
</b:includable>  
            <b:includable id='postTitle' var='post'>  
              <b:if cond='data:post.title != &quot;&quot;'>  
                <h3 class='post-title entry-title'><a expr:href='data:post.url'><data:post.title/></a></h3>  
              </b:if>  
            </b:includable>  
            <b:includable id='previousPageLink'>  
  <a class='blog-pager-newer-link' expr:href='data:newerPageUrl' expr:id='data:widget.instanceId + &quot;_blog-pager-newer-link&quot;' expr:title='data:messages.newerPosts'>  
    <data:messages.newerPosts/>  
  </a>  
</b:includable>  
            <b:includable id='threadedCommentForm' var='post'>  
  <div class='comment-form'>  
    <a name='comment-form'/>  
    <h4 id='comment-post-message'><data:messages.postAComment/></h4>  
    <b:if cond='data:this.messages.blogComment != &quot;&quot;'>  
      <p><data:this.messages.blogComment/></p>  
    </b:if>  
    <b:include data='post' name='commentFormIframeSrc'/>  
    <iframe allowtransparency='allowtransparency' class='blogger-iframe-colorize blogger-comment-from-post' expr:height='data:cmtIframeInitialHeight ?: &quot;90px&quot;' frameborder='0' id='comment-editor' name='comment-editor' src='' width='100%'/>  
    <data:post.cmtfpIframe/>  
    <script type='text/javascript'>  
      BLOG_CMT_createIframe(&#39;<data:post.appRpcRelayPath/>&#39;);  
    </script>  
  </div>  
</b:includable>  
            <b:includable id='threadedCommentJs' var='post'>  
  <script async='async' expr:src='data:post.commentSrc' type='text/javascript'/>  
  <b:template-script inline='true' name='threaded_comments'/>  
  <script type='text/javascript'>  
    blogger.widgets.blog.initThreadedComments(  
        <data:post.commentJso/>,  
        <data:post.commentMsgs/>,  
        <data:post.commentConfig/>);  
  </script>  
</b:includable>  
            <b:includable id='threadedComments' var='post'>  
  <section class='comments threaded' expr:data-embed='data:post.embedCommentForm' expr:data-num-comments='data:post.numberOfComments' id='comments'>  
    <a name='comments'/>  <b:include name='commentsTitle'/>  

<div class='comments-content'>  
  <b:if cond='data:post.embedCommentForm'>  
    <b:include data='post' name='threadedCommentJs'/>  
  </b:if>  
  <div id='comment-holder'>  
     <data:post.commentHtml/>  
  </div>  
</div>  

<p class='comment-footer'>  
  <b:if cond='data:post.allowNewComments'>  
    <b:include data='post' name='threadedCommentForm'/>  
  <b:else/>  
    <data:post.noNewCommentsText/>  
  </b:if>  
  <b:if cond='data:post.showManageComments'>  
    <b:include data='post' name='manageComments'/>  
  </b:if>  
</p>  

<b:if cond='data:showCmtPopup'>  
  <div id='comment-popup'>  
    <iframe allowtransparency='allowtransparency' frameborder='0' id='comment-actions' name='comment-actions' scrolling='no'>  
    </iframe>  
  </div>  
</b:if>

  </section>  
</b:includable>  
            <b:includable id='tooltipCss'>  
  <!-- LINT.IfChange -->  
  <style>  
    .post-body a.b-tooltip-container {  
      position: relative;  
      display: inline-block;  
    }  .post-body a.b-tooltip-container .b-tooltip {  
  display: block !important;  
  position: absolute;  
  top: 100%;  
  left: 50%;  
  transform: translate(-20%, 1px);  
  visibility: hidden;  
  opacity: 0;  
  z-index: 1;  
  transition: opacity 0.2s ease-in-out;  
}  

.post-body a.b-tooltip-container .b-tooltip iframe {  
  width: 200px;  
  height: 198px;  
  max-width: none;  
  border: none;  
  border-radius: 20px;  
  box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.2);  
}  

@media (hover: hover) {  
  .post-body a.b-tooltip-container:hover .b-tooltip {  
    visibility: visible;  
    opacity: 1;  
  }  
}

  </style>  
  <!-- LINT.ThenChange(//depot/google3/java/com/google/blogger/b2/layouts/widgets/v2-style.css) -->  
</b:includable>  
          </b:widget>  
        </b:section>  
      </main>  <aside class='sidebar-container'>  
    <b:section class='sidebar' id='sidebar' name='Sidebar' showaddelement='true'>  
      <b:widget id='Followers1' locked='false' title='Followers' type='Followers' visible='true'>  
        <b:widget-settings>  
          <b:widget-setting name='borderColorTransparent'>true</b:widget-setting>  
          <b:widget-setting name='useTemplateDefaultStyles'>true</b:widget-setting>  
          <b:widget-setting name='contentSecondaryTextColor'>#000000</b:widget-setting>  
          <b:widget-setting name='contentHeadlineColor'>#000000</b:widget-setting>  
          <b:widget-setting name='endcapTextColor'>#000000</b:widget-setting>  
          <b:widget-setting name='contentTextColor'>#000000</b:widget-setting>  
          <b:widget-setting name='contentSecondaryLinkColor'>#FFFFFF</b:widget-setting>  
          <b:widget-setting name='endcapLinkColor'>#000000</b:widget-setting>  
          <b:widget-setting name='contentLinkColor'>#000000</b:widget-setting>  
        </b:widget-settings>  
        <b:includable id='main'>

<b:if cond='data:title != "" and data:codeSnippet != ""'>
<h2 class='title'>data:title/</h2>
</b:if>

  <div class='widget-content'>  
    <div expr:id='data:widget.instanceId + &quot;-wrapper&quot;'>  
      <b:if cond='data:codeSnippet != &quot;&quot;'>  
        <div style='margin-right:2px;'>  
          <data:codeSnippet/>  
        </div>  
      </b:if>  
    </div>  
    <b:include name='quickedit'/>  
  </div>  
</b:includable>  
          </b:widget>  
          <b:widget id='BlogSearch1' locked='false' title='Search This Blog' type='BlogSearch' visible='true'>  
            <b:includable id='main'>  
  <b:include name='widget-title'/>  
  <b:include name='content'/>  
</b:includable>  
            <b:includable id='content'>  
  <div class='widget-content' role='search'>  
    <b:include name='searchForm'/>  
  </div>  
</b:includable>  
            <b:includable id='searchForm'>  
  <form expr:action='data:blog.searchUrl'>  
    <b:attr cond='not data:view.isPreview' name='target' value='_top'/>  
    <b:include name='urlParamsAsFormInput'/>  
    <div class='search-input'>  
      <input autocomplete='off' expr:aria-label='data:messages.searchThisBlog' expr:placeholder='data:messages.searchThisBlog' expr:value='data:view.isSearch ? data:view.search.query.escaped : &quot;&quot;' name='q'/>  
    </div>  
    <b:include name='searchSubmit'/>  
  </form>  
</b:includable>  
            <b:includable id='searchSubmit'>  
  <input class='search-action' expr:value='data:messages.search.escaped' type='submit'/>  
</b:includable>  
          </b:widget>  
          <b:widget id='Label1' locked='false' title='Categories' type='Label' visible='true'>  
            <b:widget-settings>  
              <b:widget-setting name='sorting'>ALPHA</b:widget-setting>  
              <b:widget-setting name='display'>LIST</b:widget-setting>  
              <b:widget-setting name='selectedLabelsList'/>  
              <b:widget-setting name='showType'>ALL</b:widget-setting>  
              <b:widget-setting name='showFreqNumbers'>false</b:widget-setting>  
            </b:widget-settings>  
            <b:includable id='main' var='this'>  
  <b:include name='widget-title'/>  
  <b:include name='content'/>  
</b:includable>  
            <b:includable id='cloud'>  
  <b:loop values='data:labels' var='label'>  
    <span class='label-size'>  
      <b:class expr:name='&quot;label-size-&quot; + data:label.cssSize'/>  
      <a class='label-name' expr:href='data:label.url'>  
        <data:label.name/>  
        <b:if cond='data:this.showFreqNumbers'>  
          <span class='label-count'><data:label.count/></span>  
        </b:if>  
      </a>  
    </span>  
  </b:loop>  
</b:includable>  
            <b:includable id='content'>  
  <div class='widget-content'>  
    <b:class expr:name='data:this.display + &quot;-label-widget-content&quot;'/>  
    <b:include cond='data:this.display == &quot;list&quot;' name='list'/>  
    <b:include cond='data:this.display == &quot;cloud&quot;' name='cloud'/>  
  </div>  
</b:includable>  
            <b:includable id='list'>  
  <ul>  
    <b:loop values='data:labels' var='label'>  
      <li>  
        <a class='label-name' expr:href='data:label.url'>  
          <data:label.name/>  
          <b:if cond='data:this.showFreqNumbers'>  
            <span class='label-count'><data:label.count/></span>  
          </b:if>  
        </a>  
      </li>  
    </b:loop>  
  </ul>  
</b:includable>  
          </b:widget>  
          <b:widget id='HTML1' locked='false' title='About Me' type='HTML' visible='true'>  
            <b:widget-settings>  
              <b:widget-setting name='content'><![CDATA[Hi, I'm Nazia Firdous. I'm learning digital skills and sharing my journey to help beginners. Welcome!]]></b:widget-setting>  
            </b:widget-settings>  
            <b:includable id='main'>  
  <b:include name='widget-title'/>  
  <div class='widget-content'>  
    <data:content/>  
  </div>  
</b:includable>  
          </b:widget>  
        </b:section>  
      </aside>  </div>  

<footer>  
  <div class='footer-links' style='margin-bottom:15px;'>

<a href='/p/about-us.html'>About Us</a> |
<a href='/p/contact-us.html'>Contact Us</a> |
<a href='/p/privacy-policy.html'>Privacy Policy</a> |
<a href='/p/disclaimer.html'>Disclaimer</a> |
<a href='/p/editorial-policy.html'>Editorial Policy</a>

</div>  
<p style='font-size:13px; margin:10px 0; color:#bae6fd;'>&#129293; My Heart Project: <a href='https://www.sabrandsukoon.online' rel='noopener' style='color:#f0d080;' target='_blank'>Sabr and Sukoon</a> &#8212; Islamic Wellness for Muslim Women</p>  
      <p>&#169; 2026 Easy Digital Journey. All rights reserved.</p>  
    </footer>  
  </div>  <b:template-script async='true' name='indie' version='1.0.0'/>

  <script>  
  //<![CDATA[  
  var sidebar = document.getElementById('sidebar-wrapper');  
  var btn = document.getElementById('openSide');  
  if(window.innerWidth < 769){  
    sidebar.style.display='none';  
    btn.onclick = function(){  
      if(sidebar.style.display=='none'){sidebar.style.display='block';}  
      else{sidebar.style.display='none';}  
    }  
  }  
  
  // Copy Link Function for Share Buttons  
  function copyPostLink(event) {  
    event.preventDefault();  
    var dummy = document.createElement('input');  
    document.body.appendChild(dummy);  
    dummy.value = window.location.href;  
    dummy.select();  
    document.execCommand('copy');  
    document.body.removeChild(dummy);  
    alert('Link copied to clipboard!');  
  }  
  //]]>  
  </script>  </body>  
</html>     