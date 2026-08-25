import { CreateVsnip, splitBodyLines } from "../../lib/vsnip/usecase/create-vsnip";

describe("splitBodyLines", () => {
  it("splits lines and removes trailing whitespace", () => {
    const ret = splitBodyLines(bodyString);
    const exp = [
      "fn main() {",
      "    input! {",
      "        a: f64,",
      "        b: f64",
      "    }",
      "    let f = |count: f64| {",
      "        let rg = (1. + count).powf(0.5);",
      "        b * count + a / rg",
      "    };",
      "    let mut left = 0.;",
      "    let mut right = f(0.) + 10.;",
      "",
      "    while right - left > 10f64.powi(-2) {",
      "        let c1 = (left * 2. + right) / 3.;",
      "        let c2 = (left + right * 2.) / 3.;",
      "",
      "        if f(c1) > f(c2) {",
      "            left = c1;",
      "        } else {",
      "            right = c2;",
      "        }",
      "    }",
      "    let ll = left.floor();",
      "    let left = f(ll);",
      "    let right =f(ll + 1.);",
      '    println!("{}", left.min(right));',
      "",
      "}",
    ];
    expect(ret).toStrictEqual(exp);
  });
});

describe("CreateVsnip", () => {
  it("creates a VS Code snippet and trims its metadata", () => {
    const usecase = new CreateVsnip();

    expect(
      usecase.execute({
        title: " main ",
        prefix: " main ",
        body: "fn main() {  \n}",
        description: " Rust main function ",
      }),
    ).toStrictEqual({
      main: {
        prefix: "main",
        body: ["fn main() {", "}"],
        description: "Rust main function",
      },
    });
  });
});

const bodyString = `fn main() {
    input! {
        a: f64,
        b: f64
    }
    let f = |count: f64| {
        let rg = (1. + count).powf(0.5);
        b * count + a / rg
    };
    let mut left = 0.;
    let mut right = f(0.) + 10.;

    while right - left > 10f64.powi(-2) {
        let c1 = (left * 2. + right) / 3.;
        let c2 = (left + right * 2.) / 3.;

        if f(c1) > f(c2) {
            left = c1;
        } else {
            right = c2;
        }
    }
    let ll = left.floor();
    let left = f(ll);
    let right =f(ll + 1.);
    println!("{}", left.min(right));

}`;
