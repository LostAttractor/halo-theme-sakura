import { documentFunction, sakura } from "../main";

export default class Photos {
  /**
   * TODO 注册经典布局相册，暂时未找到 vanilla js 的版本，暂不实现。
   *
   * @see http://miromannino.github.io/Justified-Gallery
   */
  @documentFunction(false)
  public registerJustifyLayout() {}

  /**
   * 注册瀑布流布局相册
   *
   * @see https://isotope.metafizzy.co/
   */
  @documentFunction(false)
  public registerMasonryLayout() {
    const masonryContainerElement = document.querySelector(".masonry-container");
    if (!masonryContainerElement) {
      return;
    }
    const galleryElement = masonryContainerElement.querySelector(".gallery");
    import("isotope-layout").then((module) => {
      const galleryLayout = new module.default(galleryElement, {
        layoutMode: "masonry",
        masonry: {
          gutter: 10,
        },
        itemSelector: ".gallery-item",
      });

      galleryElement?.querySelectorAll("img.lazyload").forEach((img) => {
        img.addEventListener("load", () => {
          galleryLayout.layout();
        });
      });

      galleryLayout.once("arrangeComplete", function () {
        masonryContainerElement.querySelector(".photos-content")?.classList.remove("loading");
      });

      // 过滤
      const galleryFilterbarElement = masonryContainerElement?.querySelector("#gallery-filter");
      const galleryFilterbarItemsElement = galleryFilterbarElement?.querySelectorAll("li a");
      const defaultGroup = sakura.getThemeConfig("photos").getValue("default_group", String)?.valueOf();
      galleryFilterbarItemsElement?.forEach((hrefElement) => {
        const filter = hrefElement.getAttribute("data-filter");

        // 默认分组
        if (defaultGroup) {
          if (filter == `.${defaultGroup}`) {
            galleryFilterbarItemsElement[0].classList.remove("active");
            hrefElement.classList.add("active");
            galleryLayout.arrange({
              filter: filter,
            });
          }
        }

        hrefElement.addEventListener("click", (event) => {
          event.preventDefault();
          if (hrefElement.classList.contains("active")) {
            return;
          }
          galleryFilterbarItemsElement?.forEach((item) => {
            item.classList.remove("active");
          });
          hrefElement.classList.add("active");
          galleryLayout.arrange({
            filter: filter,
          });
        });
      });

      // TODO 尝试优化
      const gridChangeElements = masonryContainerElement?.querySelectorAll("#grid-changer a");
      gridChangeElements?.forEach((gridChangeElement) => {
        gridChangeElement?.addEventListener("click", () => {
          gridChangeElements.forEach((item) => {
            item.classList.remove("active");
          });
          gridChangeElement.classList.add("active");
          galleryElement?.querySelectorAll("[class*='col-']").forEach((item) => {
            for (let i = 0; i < item.classList.length; i++) {
              const className = item.classList[i];
              if (className.startsWith("col-")) {
                item.classList.remove(className);
                i--;
              }
            }
          });
          galleryElement?.querySelectorAll(".gallery-item").forEach((item) => {
            item.classList.add("col-" + gridChangeElement.getAttribute("data-col") || "");
          });

          galleryLayout.layout();
        });
      });
    });
  }
}