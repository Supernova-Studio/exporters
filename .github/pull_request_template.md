## Description

<!-- A summary of your change. If you are modifying existing exporter or adding a new one, explain what it does. -->

## Changes to existing exporters

<!-- If you are modifying existing exporter, please explain to detail what will change for everyone who uses the exporter. Keep in mind that exporters are used by thousands of companies and any single change has potential to affect a vast number of codebases - so we will be extremely diligent in making sure nothing breaks for existing users. Delete this section if you are adding a new exporter. -->

## Checklist

- [ ] I made sure my functionality/exporter was not built before
- [ ] I run `npm run build` to make sure exporter has valid latest binary before commiting
- [ ] I run the exporter against design system with reasonable data representation to make sure it works
- [ ] I made sure exporter works for all various configuration options it provides

For existing exporters:

- [ ] I made additive change that doesn't change existing behavior or I added compatibility option to keep existing behavior so users are only affected if they opt-in

<!-- Check all above to confirm you did all the steps!  -->