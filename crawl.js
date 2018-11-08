const puppeteer = require('puppeteer');
const credentials = require('./credentials');
const fs = require('fs');

const PROJECTS_LINK = 'http://tum.go4c.org/group/team_5/project-management?p_p_id=go4c_pm_portlet_WAR_go4cpmportlet_INSTANCE_B8h6&p_p_lifecycle=0&p_p_state=maximized&p_p_mode=view&tabs1=1-56';

(async () => {
  const { page, browser } = await init();
  await page.goto(PROJECTS_LINK);
  await login(page);

  const data = {};
  const suffix = getWeekNumber(new Date());
  data.projects = await getAllProjects(page);
  saveProjectsState(data, suffix);

  await browser.close();
})();

async function init() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  return { page, browser };
}

/**
* Login to the page using the credentials provided from credentials.js file.
*/
async function login(page) {
  const USERNAME_SELECTOR = '#portlet-wrapper-58 > div.portlet-content > div > div > form > fieldset > div:nth-child(1) > input[type="text"]';
  const PASSWORD_SELECTOR = '#_58_password';
  const BUTTON_SELECTOR = '#portlet-wrapper-58 > div.portlet-content > div > div > form > fieldset > div.button-holder > input[type="submit"]';
  await page.click(USERNAME_SELECTOR, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.keyboard.type(credentials.username);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(credentials.password);
  await page.click(BUTTON_SELECTOR);
  await page.waitForNavigation();
}

/**
* Gets all the available projects, starts at tr:nth-child 2 and ends at 57.
*/
async function getAllProjects(page) {
  console.log("getting all projects");
  var projects = [];
  for (let i = 2; i <= 57; i++) {
    process.stdout.write(".");
    var project = [];

    const OVERVIEW_SEL = '#portlet-wrapper-go4c_pm_portlet_WAR_go4cpmportlet_INSTANCE_B8h6 > div.portlet-content > div > div > form > table.portlet-table > tbody > tr:nth-child(' + i + ')';
    await addOverviewInfo(OVERVIEW_SEL);

    const PROJECT_LINK = await page.$eval(OVERVIEW_SEL + ' > td:nth-child(6) > a', a => a.href);
    await page.goto(PROJECT_LINK);

    await addDescriptionInfo();
    await addIdShortNameCostInfo();
    await addStatsInfo();
    await addPreconditionsAndConstraintsInfo();
    await addResourcesInfo();

    projects.push({
      status: getStatus(project[0]),
      name: project[1],
      success: project[2],
      description: project[3],
      id: parseInt(project[4]),
      short_name: project[5],
      cost: parseInt(project[6]),
      stats: project[7],
      preconditions: project[8],
      constraints: project[9],
      resources: project[10]
    });

    await page.goto(PROJECTS_LINK);
  };
  console.log("");
  console.log("done!");
  return projects;

  async function addOverviewInfo(sel) {
    project.push(await page.$eval(sel + ' > td:nth-child(1) > img', img => img.src));
    project.push(await page.$eval(sel + ' > td:nth-child(3)', td => td.innerHTML));
    project.push(await page.$eval(sel + ' > td:nth-child(5) > table > tbody > tr > td:nth-child(3)', td => td.innerHTML));
  }

  async function addDescriptionInfo() {
    const DESCRIPTION_SELECTOR = '#portlet-wrapper-go4c_pm_portlet_WAR_go4cpmportlet_INSTANCE_B8h6 > div.portlet-content > div > div > form > table > tbody > tr:nth-child(1) > td:nth-child(1) > table > tbody > tr:nth-child(3) > td';
    project.push(await page.$eval(DESCRIPTION_SELECTOR, td => td.innerHTML));
  }

  async function addIdShortNameCostInfo() {
    const SHORT_INFO_SELECTOR = '#portlet-wrapper-go4c_pm_portlet_WAR_go4cpmportlet_INSTANCE_B8h6 > div.portlet-content > div > div > form > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr > th:nth-child(2)';
    const info = await page.$$eval(SHORT_INFO_SELECTOR, trs => trs.map(th => th.innerHTML));
    info.map(elem => project.push(elem));
  }

  async function addStatsInfo() {
    const STATS_SELECTOR = '#portlet-wrapper-go4c_pm_portlet_WAR_go4cpmportlet_INSTANCE_B8h6 > div.portlet-content > div > div > form > table > tbody > tr:nth-child(3) > td:nth-child(2) > table:nth-child(1) > tbody > tr > td > img';
    let raw_stats = await page.$$eval(STATS_SELECTOR, imgs => imgs.map(img => img.src));
    const stats = makeStatsObj(raw_stats.map(src => getImpactLevel(src)));
    project.push(stats);
  }

  async function addPreconditionsAndConstraintsInfo() {
    const PRECONS_SELECTOR = '#portlet-wrapper-go4c_pm_portlet_WAR_go4cpmportlet_INSTANCE_B8h6 > div.portlet-content > div > div > form > table > tbody > tr:nth-child(3) > td:nth-child(2) > table:nth-child(2) > tbody > tr > td';
    const tbl = await page.$$eval(PRECONS_SELECTOR, trs => trs.map(td => td.innerHTML));
    const { preconditions, constraints } = cleanPreConsInfo(tbl);
    project.push(preconditions);
    project.push(constraints);
  }

  async function addResourcesInfo() {
    const RESOURCES_SELECTOR = '#portlet-wrapper-go4c_pm_portlet_WAR_go4cpmportlet_INSTANCE_B8h6 > div.portlet-content > div > div > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td';
    let raw_resources = await page.$$eval(RESOURCES_SELECTOR, trs => trs.map(th => th.innerHTML));
    raw_resources = raw_resources.map(info => info.replace("&nbsp;", ""));
    const resources = makeResourcesObjList(raw_resources);
    project.push(resources);
  }
}

/**
 * TODO: Look up src for chosen imgs from project website to check if assumption 'green' is correct
*/
getStatus = (img_src) => {
  if (img_src.includes("_x_box")) {
    return 'blocked'
  }
  if (img_src.includes("green")) {
    return 'chosen'
  }
  if (img_src.includes("blue")) {
    return 'active'
  }
  return 'available'
}

makeStatsObj = (raw_stats) => {
  return stats = {
    bank: {
      process: raw_stats[0],
      knowledge: raw_stats[1],
      risk: raw_stats[2],
      information: raw_stats[3]
    },
    marketing: {
      process: raw_stats[4],
      knowledge: raw_stats[5],
      risk: raw_stats[6],
      information: raw_stats[7]
    },
    production: {
      process: raw_stats[8],
      knowledge: raw_stats[9],
      risk: raw_stats[10],
      information: raw_stats[11]
    },
    it: {
      process: raw_stats[12],
      knowledge: raw_stats[13],
      risk: raw_stats[14],
      information: raw_stats[15]
    },
  };
}

getImpactLevel = (img_src) => {
  return parseInt(img_src[img_src.length - 5]);
}

cleanPreConsInfo = (tbl_infos) => {
  let infos = tbl_infos.map(info => info.replace("\tNo Preconditions found.", ""));
  infos = infos.map(info => info.replace("\tNo Constraints found.", ""));
  infos = infos.filter(info => !info.includes("."));
  infos = infos.map(info => info.replace("&nbsp;", ""));
  let preconditions = infos.filter(info => infos.indexOf(info) % 2 == 0);
  preconditions = preconditions.filter(Boolean);
  let constraints = infos.filter(info => infos.indexOf(info) % 2 != 0);
  constraints = constraints.filter(Boolean);
  return { preconditions, constraints };
}

makeResourcesObjList = (raw_resources) => {
  let resources = [];
  const raw_length = raw_resources.length - 1;
  for (let x = 0; x <= raw_length; x++) {
    if (x % 4 === 0) {
      const resource = {
        name: raw_resources[x],
        buildtime: {
          amount_required: raw_resources[x+1],
          amount_allocated: raw_resources[x+2]
        },
        runtime: {
          amount_required: raw_resources[x+3]
        }
      }
      resources.push(resource);
    }
  }
  return resources;
}

getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

saveProjectsState = (data, suffix) => {
  const json = JSON.stringify(data);
  const dir = './data';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFile('data/projects-' + suffix +'.json', json, 'utf8', (err) => {  
    if (err) throw err;
    console.log('data saved as JSON');
  });
}