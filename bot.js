const Telegraf = require('telegraf')
const axios = require('axios')

const bot = new Telegraf('')

let valid =/^[А-ЯЁ][а-яё]*/ 

bot.command(['start', 'help'], (ctx) => {
    let message =
    `
Добро пожаловать в Search Bot.
Это ваш мини поисковик в Telegram.
Для использования используйте команды:

@search_project_bot wiki <Запрос на английском> - Для поиска статей в Википедии
***Пример: @search_project_bot wiki Queen***

@search_project_bot pixa <Запрос на английском> - Для поиска картинок в Pixaby
***Пример: @search_project_bot pixa Anime***

Либо используйте кнопки ниже.
    `

    ctx.reply(message, {
        reply_markup: {
        inline_keyboard :
        [
            [
                { text: "Искать статьи в Википедии", switch_inline_query_current_chat: 'wiki ' }
            ],
            [
                { text: "Искать картинки в Pixaby", switch_inline_query_current_chat: 'pixa ' }
            ]
        ]
    },
        parse_mode: 'Markdown'
    })
})

bot.inlineQuery(/pixa\s.+/, async (ctx) => {
    let input = ctx.inlineQuery.query.split(' ')
    input.shift(' ')
    let query = input.join(' ')
    let res = await axios.get(`https://pixabay.com/api/?key=16322778-09056011461809c54e7e937a4&q=${query}`)
    let data = res.data.hits
    let results = data.map((item, index) => {
        return {
            type: 'photo',
            id: String(index),
            photo_url: item.webformatURL,
            thumb_url: item.previewURL,
            photo_width: item.imageWidth,
            photo_height: item.imageHeight,
            parse_mode: 'Markdown',
            caption: `[Source](${item.webformatURL})`,
        }
    })

    ctx.answerInlineQuery(results)
}) 

bot.inlineQuery(/wiki\s.+/, async (ctx) => {
    if(ctx.inlineQuery.query.match(valid)){
        console.log(ctx.inlineQuery.query)
        return
    }
    else{
    let input = ctx.inlineQuery.query.split(' ')
    input.shift(' ')
    let query = input.join(' ')
    let res = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&limit=5`)
    let allTitles = res.data[1]

    let allLinks = res.data[3]

    if(allTitles == undefined){
        return;
    }

    let results = allTitles.map((item, index) => {
        return {
        type: 'article',
        id: String(index),
        title: item,
        input_message_content:{
            message_text: `${item}\n${allLinks[index]}`
        },
        description: allLinks[index],
        reply_markup: {
            inline_keyboard: [
                [
                    {text: "Share", switch_inline_query:`${item}`}
                ]
            ]
        }
     }
    })
    ctx.answerInlineQuery(results)
    }
})

bot.launch()
