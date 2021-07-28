/**
 * get My Followers
 */
const fs = require("fs");
const { Octokit } = require("octokit");
const { base64encode, base64decode } = require('nodejs-base64')
const { token, repo, owner, workflow_id } = require('./constants');
async function main() {
  try {
    const readmeData = fs.readFileSync(`${__dirname}/readme.md`, "utf8");
    const startWords = "<!--START_SECTION:top-followers-->";
    const endWords = "<!--END_SECTION:top-followers-->";
    const startIndex = readmeData.search(startWords) + startWords.length;
    const endIndex = readmeData.search(endWords);
    const startPart = readmeData.slice(0, startIndex);
    const endPart = readmeData.slice(endIndex);
    /**
      获取TOKEN的途径
      1. 在yml环境变量中注入 ${{ secrets.GITHUB_TOKEN }}
      2. 通过process.env获取
      ---- 这种方式可能会存在权限不足的情况
      解决方法：
      1. 申请权限更高的token
      2. 在仓库里设置自己的secret;
     */
    const getNewContent = (followers) => {
      let html = "";
      html += "\n<table>\n";
      followers.forEach((follower, index) => {
        const { avatar_url, login: name, id } = follower;
        if (index % 7 === 0) {
          if (index !== 0) {
            html += "  </tr>\n";
          }
          html += "  <tr>\n";
        }
        html += `<td align=\"center\">
              <a href="https://github.com/${name}">
                <img src="${avatar_url}" width="100px;" alt="${name}"/>
                </a>
              <br />
             <a href="https://github.com/${name}">${name}</a>
            </td>
            `;
      });
      html += "  </tr>\n</table>\n";
      const newContent = `${startPart}${html}${endPart}`;
      return newContent;
    }
    const octokit = new Octokit({ auth: token });
    /**
     * login
     */
    await octokit.rest.users.getAuthenticated()
    /**
     * getFollowers
     */
    const followersRes = await octokit.rest.users.listFollowersForAuthenticatedUser({});
    const { data: followers } = followersRes;
    const newContent = getNewContent(followers);
    /**
     * getSha
     */
    const repoContentRes = await octokit.rest.repos.getContent({
      owner,
      repo,
      ref: 'dev_fg',
      path: 'readme.md'
    })
    const { data: { sha, content } } = repoContentRes;
    if (base64decode(content).length === newContent.length) {
      console.log('has no diff😄')
      return;
    }
    fs.writeFileSync(`${__dirname}/readme.md`, newContent)
    // console.log(workflowsRuns.data);
    // await octokit.rest.repos
    //   .createOrUpdateFileContents({
    //     owner,
    //     repo,
    //     sha,
    //     branch: "dev_fg",
    //     path: "readme.md",
    //     message: ":pencil2: update Readme",
    //     content: newContent,
    //     committer: {
    //       name: "SilenceRichard",
    //       email: "silencerichard@163.com",
    //     },
    //     author: {
    //       name: "SilenceRichard",
    //       email: "silencerichard@163.com",
    //     },
    //   })
  } catch (err) {
    console.log(err)
    // main();
  }
}

main();