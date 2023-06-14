# DGA E-votechain

https://e-vote.dga.or.th/

Powered by [Nuxt3 framework](https://nuxt.com/)

## Request permissions
https://e-vote.dga.or.th/permissions/request  (Required Login)

## Monitors
https://app.pm2.io/#/bucket/640dd1c6b3fdc680cb119093
https://cloud.mongodb.com/freemonitoring/cluster/OHNLAG5AJNWYIARZ5RFXBZOBNBHFOACX'

## คู่มือการพัฒนาระบบ Digital id สพร.
https://kb.dga.or.th/s/bkcnd3p5f5r4kv7eibfg/digital-id/d/c3851d95f5r8tlpockr0/digital-id-open-id-connect

## ขั้นตอนการพัฒนาระบบ/เปิดใช้งาน 
1. หน่วยงานกรอกแบบฟอร์ม เพื่อขอใช้งาน  ไฟล์เอกสารอยู่ในหน้าระบบ Link นี้เลยนะคะ  ระบุชื่อระบบบริการที่ต้องการใช้งาน หากมีมากกว่า 1 ระบบ กรุณาระบุชื่อระบบให้ครบถ้วน 
    - แนบ Flow การใช้งาน หรือ ข้อมูลระบบบริการที่จะใช้งาน Digital id
2. แจ้งข้อมูลเพื่อให้ สพร. ลงทะเบียนระบบทดสอบ
    - Domain หรือ Public IP ระบบ
    - Login callback URL (ถ้ามีการแก้ไขจาก default .net middleware) และหมายเลข port (ถ้ามี)
    - Logout callback URL (ถ้ามีการแก้ไขจาก default .net middleware) และหมายเลข port (ถ้ามี)
    - ภาษาที่ใช้พัฒนาระบบ
3. เริ่มพํฒนา/ทดสอบ ระบบ
4. นัด สพร. ทำ UAT App Review ก่อนเปิดใช้งานจริง 1-2 สัปดาห์
5. แจ้งข้อมูลเพื่อให้ สพร. ลงทะเบียน Production 
    - Domain หรือ Public IP ระบบ
    - Login callback URL (ถ้ามีการแก้ไขจาก default .net middleware) และหมายเลข port (ถ้ามี)
    - Logout callback URL (ถ้ามีการแก้ไขจาก default .net middleware) และหมายเลข port (ถ้ามี)


> เนื่องจากภาษาที่ใช้พัฒนาเป็นแนวๆ typeScript เราเลย config ให้ใช้รูปแบบ PKCE ครับ เพื่อจะได้ไม่ต้อง store Consumer_Secret ไว้ใน app ดังนั้นจะต้องส่ง param มาเพิ่มอีก 2 ตัวครับ
