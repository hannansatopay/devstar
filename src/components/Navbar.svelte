<script>
    import FolderIcon from "~icons/mdi/folder"
    import UndoIcon from "~icons/ic/sharp-undo"
    import RedoIcon from "~icons/ic/sharp-redo"
    import BoldFont from "~icons/healthicons/b"
    import ItalicFont from "~icons/ri/italic"
    import HeadingText from "~icons/ic/sharp-text-fields"
    import StrikeThrough from "~icons/ic/sharp-strikethrough-s"
    import UnorderedList from "~icons/ant-design/unordered-list"
    import OrderedList from "~icons/codicon/list-ordered"
    import CheckList from "~icons/ic/sharp-checklist"
    import BlockQuote from "~icons/grommet-icons/block-quote"
    import Code from "~icons/ic/sharp-code"
    import Table from "~icons/mdi/table"
    import Link from "~icons/octicon/link-16"
    import Image from "~icons/mdi/file-image"
    import Refresh from "~icons/zondicons/refresh"
    import Publish from "~icons/ic/sharp-publish"
    import StackEdit from "~icons/simple-icons/stackedit"
</script>

<div>
    <nav class="bg-neutral-800 px-2 py-0">
        <div class="container mx-auto">
        <div class="flex justify-between items-center align-center py-2">
            <ul class="flex space-x-4">
                <li class="items items-add text-neutral-400"><FolderIcon class="icon"/></li>
                <li class="items items-add text-neutral-400"><UndoIcon class="icon"/></li>
                <li class="items items-add text-neutral-400"><RedoIcon class="icon"/></li>
                <li class="items items-add text-neutral-400"><BoldFont class="icon"/></li>
                <li class="items items-add text-neutral-400"><ItalicFont class="icon"/></li>
                <li class="items items-add text-neutral-400"><HeadingText class="icon"/></li>
                <li class="items items-add text-neutral-400"><StrikeThrough class="icon"/></li>
                <li class="items items-add text-neutral-400"><UnorderedList class="icon"/></li>
                <li class="items items-add text-neutral-400"><OrderedList class="icon"/></li>
                <li class="items items-add text-neutral-400"><CheckList class="icon"/></li>
                <li class="items items-add text-neutral-400"><BlockQuote class="icon"/></li>
                <li class="items items-add text-neutral-400"><Code class="icon"/></li>
                <li class="items items-add text-neutral-400"><Table class="icon"/></li>
                <li class="items items-add text-neutral-400"><Link class="icon"/></li>
                <li class="items items-add text-neutral-400"><Image class="icon"/></li>
            </ul>

            <ul class="flex space-x-4">
                <a href="/" class="text-neutral-400 font-semi text-xl">Welcome File</a>
                <li class="items items-add text-neutral-400"><Refresh class="icon"/></li>
                <li class="items items-add text-neutral-400"><Publish class="icon"/></li>
                <li class="items items-add text-amber-500"><StackEdit class="icon"/></li>
            </ul>
        </div>
        </div>
    </nav>
</div>

<style>
	.items {
		font-size: 1.4rem;
	}
    .icon {
	position: absolute;
    left: -10000px;
    top: auto;
    width:1px;
    height:1px;
    overflow:hidden;
	}
</style>

