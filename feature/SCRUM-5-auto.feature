# SCRUM-5
# Source: Jira SCRUM-5 — Form Fields feature login

Feature: SCRUM-5 — Form Fields feature login
  As a visitor
  I want to navigate to the Practice Automation site and open the Form Fields feature
  So that I can view the Name and Password fields on that page

  # Jira: SCRUM-5
  Scenario: Navigate to Form Fields and verify fields are visible
    Given I open "https://practice-automation.com/"
    When I click the "Form Fields" feature on the landing page
    Then I should be on the "Form Fields" page
    And I should see a "Name" field
    And I should see a "Password" field
