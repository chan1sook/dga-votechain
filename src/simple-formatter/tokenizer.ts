interface SimpleFormatterParagraph {
  textlines: Array<SimpleFormatterTextLine>
}

interface SimpleFormatterTextLine {
  texts: Array<SimpleFormatterText>
}
interface SimpleFormatterText {
  content: string,
  href?: string,
}

type IRemainToken = {
  remain?: string,
}

type SimpleFormatterParagraphToken = SimpleFormatterParagraph & IRemainToken;

function eatParagraph(content: string) : SimpleFormatterParagraphToken {
  let paragraph = content;
  let remain: string | undefined;

  const regexResult = /\n([^\S\r\n]*\n)+/.exec(content);
  if(regexResult) {
    const endPos = regexResult.index + regexResult[0].length;
    paragraph = content.substring(0, endPos).trim();
    remain = content.substring(endPos);
  }
  
  let textlines : Array<SimpleFormatterTextLineToken> = [];
  while(paragraph.length > 0) {
    const token = eatTextLine(paragraph);
    textlines.push({
      ...token,
      remain: undefined,
    });

    if(!token.remain) {
      break;
    }

    paragraph = token.remain;
  }

  return {
    textlines,
    remain,
  }
}

type SimpleFormatterTextLineToken = SimpleFormatterTextLine & IRemainToken;

function eatTextLine(content: string) : SimpleFormatterTextLineToken {
  const breakLineIndex = content.indexOf("\n");
  let textlineContent = content.trim();
  let remain: string | undefined;

  if(breakLineIndex !== -1) {
    textlineContent = content.substring(0, breakLineIndex).trim();
    remain = content.substring(breakLineIndex).trim();
  }

  let texts : Array<SimpleFormatterTextToken> = [];
  while(textlineContent.length > 0) {
    const token = eatText(textlineContent);
    texts.push({
      ...token,
      remain: undefined,
    });

    if(!token.remain) {
      break;
    }

    textlineContent = token.remain;
  }

  return {
    texts,
    remain
  }
}

type SimpleFormatterTextToken = SimpleFormatterText & IRemainToken;

function eatText(content: string) : SimpleFormatterTextToken {
  let checkExec = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.exec(content);

  if(checkExec) {
    if(checkExec.index === 0) {
      const index = checkExec.index + checkExec[0].length;
      const link = content.substring(0, index).trim();
      return {
        content: link,
        href: link,
        remain: content.substring(index),
      };
    } else {
      return {
        content: content.substring(0, checkExec.index),
        remain: content.substring(checkExec.index),
      }
    }
  }
  
  return {
    content,
  }
}


export function toSimpleForamtterTokenize(content: string) : Array<SimpleFormatterParagraph> {
  let subContent = content;
  let nodes : Array<SimpleFormatterParagraph> = [];
  while(subContent.length > 0) {
    const token = eatParagraph(subContent);
    nodes.push({
      textlines: token.textlines,
    });

    if(!token.remain) {
      break;
    }

    subContent = token.remain;
  }
  return nodes;
}