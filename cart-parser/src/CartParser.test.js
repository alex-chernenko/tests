import CartParser from './CartParser';

let parser, validate, calcTotal, parseLine;

beforeEach(() => {
    parser = new CartParser();
    validate = parser.validate.bind(parser);
    calcTotal = parser.calcTotal.bind(parser)
    parseLine = parser.parseLine.bind(parser);
    
});

describe("CartParser - unit tests", () => {
    it ("should call createError if column name != schema column name",() => {
        
        parser.createError = jest.fn();
        validate("Producy name,Price,Quantity");
        expect(parser.createError).toHaveBeenCalledTimes(1);
    })

    it ("should have error type \"header\"",() => {
        const error = [
            {"column": 0, "message": "Expected header to be named \"Product name\" but received Producy name.", "row": 0, "type": "header"}
        ]
        
        let errors = validate("Producy name,Price,Quantity");
        expect(errors).toMatchObject(error);
    })

    it ("should call createError if cell is empty",() => {
        
        parser.createError = jest.fn();
        validate("Product name,Price,Quantity\n     ");
        expect(parser.createError).toHaveBeenCalledTimes(1);
       
    })

    it ("should have error type \"row\"",() => {

        const error = [
            {"column": -1, "message": "Expected row to have 3 cells but received 1.", "row": 1, "type": "row"}
        ]
        let errors = validate("Product name,Price,Quantity\n     ");
        expect(errors).toMatchObject(error);

    })
    it ("should call createError if expected cell isn`t a number",() => {
        
        parser.createError = jest.fn();
        validate("Product name,Price,Quantity\nMollis consequat,sdfsdf,2");
        expect(parser.createError).toHaveBeenCalledTimes(1);

    })
    it ("should have error type \"cell\" expected to be a positibe number",() => {

        const error = [
            {"column": 1, "message": "Expected cell to be a positive number but received \"sdfsdf\".", "row": 1, "type": "cell"}
        ]
        let errors = validate("Product name,Price,Quantity\nMollis consequat,sdfsdf,2");
        expect(errors).toMatchObject(error);

    })
    it ("should have error type \"cell\" expected to be a nonempty string",() => {

        const error = [
            {"column": 0, "message": "Expected cell to be a nonempty string but received \"\".", "row": 1, "type": "cell"}
        ]
        let errors = validate("Product name,Price,Quantity\n,,,");
        expect(errors).toMatchObject(error);

    })
    it ("should return empty array of errors",() => {
        
        parser.createError = jest.fn();
        let errors = validate("Product name,Price,Quantity\nMollis consequat,9.00,2");
        expect(errors).toMatchObject([]);
       
    })
    it ("should return json object",() => {
        
        parser.createError = jest.fn();
        let csvLine = parseLine("Mollis consequat,9.00,2");
        expect(csvLine).toMatchObject({
            "id": expect.anything(),
            "name": "Mollis consequat",
            "price": 9,
            "quantity": 2
        });
       
    })
    it ("should return total price", () => {
        
        const items = [
            {
                "id": "3e6def17-5e87-4f27-b6b8-ae78948523a9",
                "name": "Mollis consequat",
                "price": 9,
                "quantity": 2
            },
            {
                "id": "90cd22aa-8bcf-4510-a18d-ec14656d1f6a",
                "name": "Tvoluptatem",
                "price": 10.32,
                "quantity": 1
            }
        ]
        expect(calcTotal(items)).toBe(28.32);
    })
});

describe("CartParser - integration tests", () => {
    it(`should parse cart.csv`, () => {

        parser.createError = jest.fn();
        const cartJson = parser.parse("samples/cart.csv");
        expect(cartJson).toMatchObject(
            {
                "items": [
                    {
                        "id": expect.anything(),
                        "name": "Mollis consequat",
                        "price": 9,
                        "quantity": 2
                    },
                    {
                        "id": expect.anything(),
                        "name": "Tvoluptatem",
                        "price": 10.32,
                        "quantity": 1
                    },
                    {
                        "id": expect.anything(),
                        "name": "Scelerisque lacinia",
                        "price": 18.9,
                        "quantity": 1
                    },
                    {
                        "id": expect.anything(),
                        "name": "Consectetur adipiscing",
                        "price": 28.72,
                        "quantity": 10
                    },
                    {
                        "id": expect.anything(),
                        "name": "Condimentum aliquet",
                        "price": 13.9,
                        "quantity": 1
                    }
                ],
                "total": 348.32
            })
        expect(parser.createError).toHaveBeenCalledTimes(0);
        expect(cartJson.total).toBeCloseTo(348.32);
        
    });
    
});