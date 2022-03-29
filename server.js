if(process.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const port = process.env.PORT;

const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const axios = require('axios');
const ejs = require('ejs')
const puppeteer = require('puppeteer')
app.use(bodyParser.json());



app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:false})) 
//Makes webpage data available
var search_urls = require('./websites.json')


search_urls.forEach(async(website,index)=>{
    const scrape_data = (async () => {
        const browser = await puppeteer.launch({"headless":"false"});
        const page = await browser.newPage();
        await page.goto(website.start.url,{
            waitUntil:'networkidle2'
        });

        const handle = await page.$$(website.start.selector);
        handle.forEach(async(h,index)=>{
            const yourHref = await page.evaluate(anchor => anchor.getAttribute('href'), h);
            const new_page = await browser.newPage();
            await new_page.goto(website.start.base_url + yourHref,{
                waitUntil:'networkidle2'
            });
            var captured_date =new Date();
            var unix = captured_date.getTime();
            console.log('taking a screenshot')
            await new_page.screenshot({'path':"./scrape_images/"+website.name+"-"+unix+".png","fullPage":true});
            const title = await new_page.$eval(website.scrape[0].ref, el => el.textContent);
            console.log('got title')
            const location = await new_page.$eval(website.scrape[1].ref, el=> el.textContent);
            console.log('got location')
            const description = await new_page.$eval(website.scrape[2].ref, el=> el.textContent); //Not Working As Expected.. Returning all text of page
            console.log('got description')
            var responsibilities = []
            const r_handle = await new_page.$$(website.scrape[3].ref);
            r_handle.forEach(async(r,index)=>{
                const li_arr = await page.evaluate(ul => console.log(ul.textContent),r );
                console.log(li_arr)
            })

        })
        console.log('done')
      })();
})


app.post('/getscript-data', (req,res)=>{
    var body = req.body;

})
app.get('/', (req,res)=>{
    res.render('./home.ejs')
})

app.listen(port);
console.log('Listening on port '+ port)