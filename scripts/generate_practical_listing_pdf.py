from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:
    raise SystemExit("Pillow is required to generate the PDF.") from exc


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "practical_listing_template.pdf"

PAGE_WIDTH = 1240
PAGE_HEIGHT = 1754
MARGIN_X = 92
TOP_MARGIN = 88
BOTTOM_MARGIN = 88
CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2

BG = "#ffffff"
BRAND = "#2d68ff"
BRAND_SOFT = "#eef4ff"
TEXT = "#101828"
SUB = "#4b5565"
RULE = "#e6edf8"
DASH = "#ced8ea"
CHECK = "#9db2e4"

FONT_REGULAR_PATH = Path(r"C:\Windows\Fonts\malgun.ttf")
FONT_BOLD_PATH = Path(r"C:\Windows\Fonts\malgunbd.ttf")

if not FONT_REGULAR_PATH.exists() or not FONT_BOLD_PATH.exists():
    raise SystemExit("Required Windows fonts were not found.")

FONT_SMALL = ImageFont.truetype(str(FONT_REGULAR_PATH), 20)
FONT_BOLD = ImageFont.truetype(str(FONT_BOLD_PATH), 24)
FONT_BOLD_SMALL = ImageFont.truetype(str(FONT_BOLD_PATH), 20)
FONT_TITLE = ImageFont.truetype(str(FONT_BOLD_PATH), 42)
FONT_SECTION = ImageFont.truetype(str(FONT_BOLD_PATH), 30)
FONT_FIELD = ImageFont.truetype(str(FONT_BOLD_PATH), 22)
FONT_FOOTER = ImageFont.truetype(str(FONT_REGULAR_PATH), 16)

SECTIONS = [
    {
        "title": "1. 매출 구조",
        "desc": "매출 크기만 말하지 말고 흐름과 변동 이유까지 보이게 정리합니다.",
        "fields": ["월 매출", "월 순수익", "성수기 / 비수기", "매출이 오르는 시점", "매출이 떨어지는 시점"],
    },
    {
        "title": "2. 고객 구조",
        "desc": "고객이 누구고 왜 오는지가 보여야 양수자도 근거를 이해합니다.",
        "fields": ["단골 비중", "신규 고객 유입 경로", "주요 고객 연령대", "고객이 자주 찾는 이유", "고객이 이탈하는 이유"],
    },
    {
        "title": "3. 운영 구조",
        "desc": "내가 빠지면 매장이 어떻게 돌아가는지 보여주는 영역입니다.",
        "fields": ["직원 구성", "근무 방식", "사장 개입도", "운영 난이도", "인수 후 바로 운영 가능 여부"],
    },
    {
        "title": "4. 매출 발생 구조",
        "desc": "숫자 뒤에 있는 상권, 고객, 운영 반복 구조를 정리합니다.",
        "fields": ["이 매출이 나오는 가장 큰 이유", "매출이 유지되는 구조", "이 구조가 깨질 수 있는 리스크"],
    },
    {
        "title": "5. 양수자 관점",
        "desc": "양수자가 그대로 이어받을 것과 개선할 것을 구분해 보여주는 구간입니다.",
        "fields": ["인수 후 그대로 유지 가능한 요소", "반드시 이어받아야 하는 운영 방식", "개선하면 더 좋아질 부분"],
    },
]


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    return draw.textbbox((0, 0), text, font=font)[2]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for ch in text:
        candidate = current + ch
        if not current or text_width(draw, candidate, font) <= max_width:
            current = candidate
        else:
            lines.append(current.rstrip())
            current = ch.lstrip()
    if current:
        lines.append(current.rstrip())
    return lines


def new_page(page_number: int, first_page: bool = False) -> tuple[Image.Image, ImageDraw.ImageDraw, int]:
    image = Image.new("RGB", (PAGE_WIDTH, PAGE_HEIGHT), BG)
    draw = ImageDraw.Draw(image)
    y = TOP_MARGIN

    if first_page:
        chip_label = "실전 템플릿"
        chip_width = text_width(draw, chip_label, FONT_BOLD_SMALL) + 36
        draw.rounded_rectangle((MARGIN_X, y, MARGIN_X + chip_width, y + 42), radius=21, fill=BRAND_SOFT)
        draw.text((MARGIN_X + 18, y + 8), chip_label, font=FONT_BOLD_SMALL, fill=BRAND)
        y += 64

        draw.text((MARGIN_X, y), "실전 매물 소개 템플릿", font=FONT_TITLE, fill=TEXT)
        y += 66

        intro_lines = [
            "매물 소개 전에 운영 구조를 이 순서로 정리해보세요.",
            "출력하거나 공유해서 쓰기 쉬운 체크형 템플릿으로 구성했습니다.",
        ]
        for line in intro_lines:
            draw.text((MARGIN_X, y), line, font=FONT_SMALL, fill=SUB)
            y += 30
        y += 10
    else:
        draw.text((MARGIN_X, y), "실전 매물 소개 템플릿", font=FONT_BOLD_SMALL, fill=TEXT)
        page_label = f"{page_number} page"
        draw.text((PAGE_WIDTH - MARGIN_X - text_width(draw, page_label, FONT_SMALL), y), page_label, font=FONT_SMALL, fill=SUB)
        y += 34

    draw.line((MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y), fill=RULE, width=2)
    y += 34
    return image, draw, y


def draw_footer(draw: ImageDraw.ImageDraw) -> None:
    draw.line((MARGIN_X, PAGE_HEIGHT - 54, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 54), fill=RULE, width=2)
    draw.text((MARGIN_X, PAGE_HEIGHT - 38), "출력 후 수기로 체크하거나, 웹 화면과 함께 사용해도 됩니다.", font=FONT_FOOTER, fill=SUB)


def add_dashed_line(draw: ImageDraw.ImageDraw, y: int, end_x: int) -> None:
    x = MARGIN_X
    while x < end_x:
        draw.line((x, y, min(x + 10, end_x), y), fill=DASH, width=2)
        x += 18


def main() -> None:
    pages: list[Image.Image] = []
    page_number = 1
    image, draw, y = new_page(page_number, first_page=True)

    for section in SECTIONS:
        estimated_height = 48 + 34 + len(section["fields"]) * 86
        if y + estimated_height > PAGE_HEIGHT - BOTTOM_MARGIN - 70:
            draw_footer(draw)
            pages.append(image)
            page_number += 1
            image, draw, y = new_page(page_number)

        draw.text((MARGIN_X, y), section["title"], font=FONT_SECTION, fill=TEXT)
        y += 42

        for line in wrap_text(draw, section["desc"], FONT_SMALL, CONTENT_WIDTH):
            draw.text((MARGIN_X, y), line, font=FONT_SMALL, fill=SUB)
            y += 28

        y += 6
        draw.line((MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y), fill=RULE, width=2)
        y += 18

        for field in section["fields"]:
            field_lines = wrap_text(draw, field, FONT_FIELD, CONTENT_WIDTH - 140)
            checkbox_x = PAGE_WIDTH - MARGIN_X - 74
            box_y = y + 2

            for line in field_lines:
                draw.text((MARGIN_X, y), line, font=FONT_FIELD, fill=TEXT)
                y += 28

            draw.rounded_rectangle((checkbox_x, box_y, checkbox_x + 24, box_y + 24), radius=6, outline=CHECK, width=2)
            draw.text((checkbox_x + 34, box_y - 1), "준비", font=FONT_SMALL, fill=SUB)

            dashed_y = y + 10
            add_dashed_line(draw, dashed_y, checkbox_x - 16)
            y = dashed_y + 24

        y += 14

    if y + 80 > PAGE_HEIGHT - BOTTOM_MARGIN:
        draw_footer(draw)
        pages.append(image)
        page_number += 1
        image, draw, y = new_page(page_number)

    closing = "기록이 쌓이면, 매장은 점점 설명되는 상태가 됩니다."
    draw.text((MARGIN_X, y), closing, font=FONT_BOLD, fill=BRAND)
    y += 36

    closing_desc = "웹에서는 체크하며 확인하고, 이 PDF는 출력용 또는 공유용 템플릿으로 활용하세요."
    for line in wrap_text(draw, closing_desc, FONT_SMALL, CONTENT_WIDTH):
        draw.text((MARGIN_X, y), line, font=FONT_SMALL, fill=SUB)
        y += 28

    draw_footer(draw)
    pages.append(image)

    pages[0].save(OUTPUT, save_all=True, append_images=pages[1:], resolution=150.0)
    print(OUTPUT)


if __name__ == "__main__":
    main()
