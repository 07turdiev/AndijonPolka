const {createIdForApplication} = require("../src/helpers/createId")


describe("Create Id for for application",() =>{
    test("create id if everything is correct",() =>{
          const {result} = createIdForApplication("AC1234")
          expect(result).toEqual("AC1235")
    })
    test("return error if wrong id entered",() =>{
        const {err} = createIdForApplication("A2123")
        expect(err).toEqual(115)
    })
})






